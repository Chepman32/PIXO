import Foundation
import UIKit
import ImageIO
import UniformTypeIdentifiers

@objc(PixoImageConverter)
class PixoImageConverter: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(convertImage:targetFormat:options:resolver:rejecter:)
  func convertImage(
    _ sourcePath: String,
    targetFormat: String,
    options: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let start = CFAbsoluteTimeGetCurrent()

    do {
      let sourceURL = try normalizedURL(from: sourcePath)
      guard FileManager.default.fileExists(atPath: sourceURL.path) else {
        rejecter("source_not_found", "Source file does not exist", nil)
        return
      }

      let outputURL = try makeOutputURL(format: targetFormat)

      if targetFormat.lowercased() == "pdf" {
        let result = try convertToPDF(sourceURL: sourceURL, outputURL: outputURL)
        resolver([
          "outputPath": result.outputURL.path,
          "originalSize": result.originalSize,
          "convertedSize": result.convertedSize,
          "compressionRatio": result.compressionRatio,
          "duration": Int((CFAbsoluteTimeGetCurrent() - start) * 1000),
          "format": "pdf",
          "dimensions": [
            "width": result.width,
            "height": result.height
          ]
        ])
        return
      }

      guard let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
            let sourceImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        rejecter("decode_failed", "Unable to decode source image", nil)
        return
      }

      let sourceProperties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [String: Any]
      let quality = normalizedQuality(from: options["quality"])
      let preserveMetadata = (options["preserveMetadata"] as? Bool) ?? true
      let progressive = (options["progressive"] as? Bool) ?? false
      let stripColorProfile = (options["stripColorProfile"] as? Bool) ?? false
      let maxDimension = (options["maxDimension"] as? NSNumber)?.doubleValue
      let maintainAspectRatio = (options["maintainAspectRatio"] as? Bool) ?? true

      let finalImage: CGImage
      if let maxDimension = maxDimension, maxDimension > 0 {
        finalImage = resizeImage(
          sourceImage,
          maxDimension: CGFloat(maxDimension),
          maintainAspectRatio: maintainAspectRatio
        ) ?? sourceImage
      } else {
        finalImage = sourceImage
      }

      guard let uti = utiIdentifier(for: targetFormat),
            let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, uti as CFString, 1, nil) else {
        rejecter("encoder_unavailable", "Target format is not supported on this device", nil)
        return
      }

      var metadata: [String: Any] = [:]
      if preserveMetadata, let sourceProperties = sourceProperties {
        metadata = sourceProperties
      }

      if stripColorProfile {
        metadata.removeValue(forKey: kCGImagePropertyColorModel as String)
        metadata.removeValue(forKey: kCGImagePropertyProfileName as String)
      }

      metadata[kCGImageDestinationLossyCompressionQuality as String] = quality

      if targetFormat.lowercased() == "jpg" {
        var jfif = metadata[kCGImagePropertyJFIFDictionary as String] as? [String: Any] ?? [:]
        jfif[kCGImagePropertyJFIFIsProgressive as String] = progressive
        metadata[kCGImagePropertyJFIFDictionary as String] = jfif
      }

      CGImageDestinationAddImage(destination, finalImage, metadata as CFDictionary)

      if !CGImageDestinationFinalize(destination) {
        rejecter("encode_failed", "Failed to encode converted image", nil)
        return
      }

      let originalSize = fileSize(for: sourceURL)
      let convertedSize = fileSize(for: outputURL)
      let duration = Int((CFAbsoluteTimeGetCurrent() - start) * 1000)

      resolver([
        "outputPath": outputURL.path,
        "originalSize": originalSize,
        "convertedSize": convertedSize,
        "compressionRatio": originalSize > 0 ? Double(convertedSize) / Double(originalSize) : 1,
        "duration": duration,
        "format": targetFormat.lowercased(),
        "dimensions": [
          "width": finalImage.width,
          "height": finalImage.height
        ]
      ])
    } catch {
      rejecter("conversion_failed", error.localizedDescription, error)
    }
  }

  @objc(getImageMetadata:resolver:rejecter:)
  func getImageMetadata(
    _ imagePath: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let url = try normalizedURL(from: imagePath)
      guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
            let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [String: Any] else {
        rejecter("metadata_failed", "Unable to read image metadata", nil)
        return
      }

      let width = properties[kCGImagePropertyPixelWidth as String] as? Int ?? 0
      let height = properties[kCGImagePropertyPixelHeight as String] as? Int ?? 0
      let orientation = properties[kCGImagePropertyOrientation as String] as? Int ?? 1
      let dpi = properties[kCGImagePropertyDPIHeight as String] as? Double ?? 72
      let hasAlpha = properties[kCGImagePropertyHasAlpha as String] as? Bool ?? false
      let colorSpace = properties[kCGImagePropertyColorModel as String] as? String ?? "unknown"
      let exif = properties[kCGImagePropertyExifDictionary as String] as? [String: Any]

      resolver([
        "width": width,
        "height": height,
        "format": url.pathExtension.lowercased(),
        "colorSpace": colorSpace,
        "hasAlpha": hasAlpha,
        "dpi": dpi,
        "orientation": orientation,
        "fileSize": fileSize(for: url),
        "creationDate": creationDate(for: url),
        "exifData": exif ?? [:]
      ])
    } catch {
      rejecter("metadata_failed", error.localizedDescription, error)
    }
  }

  @objc(estimateOutputSize:targetFormat:quality:resolver:rejecter:)
  func estimateOutputSize(
    _ sourcePath: String,
    targetFormat: String,
    quality: NSNumber,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let sourceURL = try normalizedURL(from: sourcePath)
      guard let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
            let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        rejecter("estimate_failed", "Unable to decode image for estimate", nil)
        return
      }

      let qualityValue = normalizedQuality(from: quality)
      if targetFormat.lowercased() == "pdf" {
        let original = fileSize(for: sourceURL)
        resolver(Int(Double(original) * 0.95))
        return
      }

      guard let uti = utiIdentifier(for: targetFormat),
            let data = CFDataCreateMutable(nil, 0),
            let destination = CGImageDestinationCreateWithData(data, uti as CFString, 1, nil) else {
        rejecter("estimate_failed", "Unsupported target format", nil)
        return
      }

      let props: [String: Any] = [
        kCGImageDestinationLossyCompressionQuality as String: qualityValue
      ]
      CGImageDestinationAddImage(destination, image, props as CFDictionary)
      guard CGImageDestinationFinalize(destination) else {
        rejecter("estimate_failed", "Failed to estimate size", nil)
        return
      }

      resolver(CFDataGetLength(data))
    } catch {
      rejecter("estimate_failed", error.localizedDescription, error)
    }
  }

  private func convertToPDF(sourceURL: URL, outputURL: URL) throws -> (outputURL: URL, originalSize: Int, convertedSize: Int, compressionRatio: Double, width: Int, height: Int) {
    guard let imageSource = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
          let cgImage = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else {
      throw NSError(domain: "PixoImageConverter", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Unable to decode source image for PDF conversion"])
    }

    let width = cgImage.width
    let height = cgImage.height
    let pageRect = CGRect(x: 0, y: 0, width: width, height: height)
    let renderer = UIGraphicsPDFRenderer(bounds: pageRect)

    try renderer.writePDF(to: outputURL) { ctx in
      ctx.beginPage()
      UIImage(cgImage: cgImage).draw(in: pageRect)
    }

    let originalSize = fileSize(for: sourceURL)
    let convertedSize = fileSize(for: outputURL)
    let ratio = originalSize > 0 ? Double(convertedSize) / Double(originalSize) : 1
    return (outputURL, originalSize, convertedSize, ratio, width, height)
  }

  private func normalizedURL(from input: String) throws -> URL {
    let value = input.hasPrefix("file://") ? String(input.dropFirst(7)) : input
    if value.isEmpty {
      throw NSError(domain: "PixoImageConverter", code: 1002, userInfo: [NSLocalizedDescriptionKey: "Source path is empty"])
    }
    return URL(fileURLWithPath: value)
  }

  private func makeOutputURL(format: String) throws -> URL {
    let fileManager = FileManager.default
    let root = fileManager.temporaryDirectory.appendingPathComponent("pixo-output", isDirectory: true)

    if !fileManager.fileExists(atPath: root.path) {
      try fileManager.createDirectory(at: root, withIntermediateDirectories: true)
    }

    let fileName = "pixo-\(UUID().uuidString.lowercased()).\(format.lowercased())"
    return root.appendingPathComponent(fileName)
  }

  private func normalizedQuality(from value: Any?) -> Double {
    guard let number = value as? NSNumber else {
      return 0.8
    }
    let raw = number.doubleValue
    if raw <= 1 {
      return max(0.01, min(1, raw))
    }
    return max(0.01, min(1, raw / 100))
  }

  private func resizeImage(_ image: CGImage, maxDimension: CGFloat, maintainAspectRatio: Bool) -> CGImage? {
    let width = CGFloat(image.width)
    let height = CGFloat(image.height)
    if width <= maxDimension && height <= maxDimension {
      return image
    }

    let targetSize: CGSize
    if maintainAspectRatio {
      let scale = min(maxDimension / width, maxDimension / height)
      targetSize = CGSize(width: width * scale, height: height * scale)
    } else {
      targetSize = CGSize(width: maxDimension, height: maxDimension)
    }

    guard let colorSpace = image.colorSpace ?? CGColorSpace(name: CGColorSpace.sRGB),
          let context = CGContext(
            data: nil,
            width: Int(targetSize.width.rounded()),
            height: Int(targetSize.height.rounded()),
            bitsPerComponent: image.bitsPerComponent,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: image.bitmapInfo.rawValue
          ) else {
      return image
    }

    context.interpolationQuality = .high
    context.draw(image, in: CGRect(origin: .zero, size: targetSize))
    return context.makeImage()
  }

  private func utiIdentifier(for format: String) -> String? {
    switch format.lowercased() {
    case "png":
      return UTType.png.identifier
    case "jpg", "jpeg":
      return UTType.jpeg.identifier
    case "webp":
      return UTType.webP.identifier
    case "heic", "heif":
      return UTType.heic.identifier
    case "bmp":
      return UTType.bmp.identifier
    default:
      return nil
    }
  }

  private func fileSize(for url: URL) -> Int {
    let attrs = try? FileManager.default.attributesOfItem(atPath: url.path)
    return attrs?[.size] as? Int ?? 0
  }

  private func creationDate(for url: URL) -> String {
    let attrs = try? FileManager.default.attributesOfItem(atPath: url.path)
    let date = attrs?[.creationDate] as? Date ?? Date()
    return ISO8601DateFormatter().string(from: date)
  }
}

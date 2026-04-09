import Foundation
import React

@objc(SquozeDeviceLocale)
class SquozeDeviceLocale: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc
  func constantsToExport() -> [AnyHashable: Any]! {
    [
      "localeIdentifier": Self.currentLocaleIdentifier()
    ]
  }

  private static func currentLocaleIdentifier() -> String {
    let localeIdentifier = Locale.preferredLanguages.first ?? Locale.current.identifier
    return localeIdentifier.replacingOccurrences(of: "_", with: "-")
  }
}

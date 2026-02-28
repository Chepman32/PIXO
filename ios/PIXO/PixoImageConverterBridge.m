#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PixoImageConverter, NSObject)

RCT_EXTERN_METHOD(convertImage:(NSString *)sourcePath
                  targetFormat:(NSString *)targetFormat
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(getImageMetadata:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(estimateOutputSize:(NSString *)sourcePath
                  targetFormat:(NSString *)targetFormat
                  quality:(nonnull NSNumber *)quality
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end

//  TeethClassifierBridge.m
//  BloomDent

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TeethClassifier, NSObject)

RCT_EXTERN_METHOD(infer:(NSString *)base64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

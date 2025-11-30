//
//  TeethClassifierBridge.m
//  BloomDent
//
//  Created by 최기훈 on 12/1/25.
//

// TeethClassifierBridge.m

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TeethClassifier, NSObject)

RCT_EXTERN_METHOD(infer:(NSData *)imageData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

// TeethClassifier.swift
// BloomDent

import Foundation
import TensorFlowLite          // pod 'TensorFlowLiteC' / 'TensorFlowLiteSwift'
import React                   // RCTPromiseResolveBlock, RCTPromiseRejectBlock

@objc(TeethClassifier)
class TeethClassifier: NSObject {

  // RN에서 모듈 이름으로 사용됨
  @objc static func moduleName() -> String! {
    return "TeethClassifier"
  }

  // 메인 스레드에서 초기화 여부 (대부분 false)
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // TFLite 인터프리터
  private var interpreter: Interpreter?

  override init() {
    super.init()
    loadModel()
  }

  /// TFLite 모델 로드
  private func loadModel() {
    guard let modelPath = Bundle.main.path(
      forResource: "teeth3_dynamic",   // 또는 "teeth3_fp32" (실제 파일 이름과 맞추기)
      ofType: "tflite"
    ) else {
      print("❌ TFLite model not found")
      return
    }

    do {
      interpreter = try Interpreter(modelPath: modelPath)
      try interpreter?.allocateTensors()
      print("✅ Model loaded successfully")
    } catch {
      print("❌ Failed to load model:", error)
    }
  }

  // =====================================================
  // JS에서 호출할 메서드
  // Obj-C 브리지:
  // RCT_EXTERN_METHOD(infer:(NSData *)imageData
  //                   withResolver:(RCTPromiseResolveBlock)resolve
  //                   rejecter:(RCTPromiseRejectBlock)reject)
  // =====================================================
  @objc(infer:withResolver:rejecter:)
  func infer(
    _ imageData: Data,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let interpreter = interpreter else {
      reject("no_interpreter", "Interpreter is not ready", nil)
      return
    }

    do {
      // TODO: 여기서 imageData(이미지 원본)를
      // 1) UIImage 로 디코딩
      // 2) 224x224로 리사이즈
      // 3) Float32 배열 (RGB 정규화) 로 변환
      // → 그 결과를 inputTensorData 로 사용해야 합니다.
      //
      // 지금은 **임시로** imageData 자체가 이미 Float32 텐서라고 가정합니다.

      let inputTensorData = imageData

      try interpreter.copy(inputTensorData, toInputAt: 0)
      try interpreter.invoke()

      let outputTensor = try interpreter.output(at: 0)

      // 예시: Float32 배열로 변환 (ex. [p_lower, p_upper, p_front])
      let results: [Float32] = outputTensor.data.toArray(type: Float32.self)

      // JS 쪽으로 그대로 배열을 반환
      resolve(results)
    } catch {
      print("❌ Inference failed:", error)
      reject("inference_failed", "Failed to run inference", error)
    }
  }
}

// MARK: - Data → [T] 변환 유틸
extension Data {
  /// Data를 제네릭 배열로 변환 (예: Float32.self)
  func toArray<T>(type: T.Type) -> [T] {
    let elementCount = self.count / MemoryLayout<T>.stride
    return self.withUnsafeBytes { bufferPointer in
      let ptr = bufferPointer.bindMemory(to: T.self)
      return Array(ptr[0..<elementCount])
    }
  }
}

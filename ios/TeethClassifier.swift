<<<<<<< HEAD
//  TeethClassifier.swift
//  BloomDent

import Foundation
import UIKit
import TensorFlowLite          // pod 'TensorFlowLiteSwift' 로 설치된 모듈
import React                  // RCTPromiseResolveBlock, RCTPromiseRejectBlock
=======
// TeethClassifier.swift
// BloomDent

import Foundation
import TensorFlowLite          // pod 'TensorFlowLiteC' / 'TensorFlowLiteSwift'
import React                   // RCTPromiseResolveBlock, RCTPromiseRejectBlock
>>>>>>> 2433841413de3acf37bc6eea006c8b9f322ac4fd

@objc(TeethClassifier)
class TeethClassifier: NSObject {

<<<<<<< HEAD
  // RN 모듈 이름
=======
  // RN에서 모듈 이름으로 사용됨
>>>>>>> 2433841413de3acf37bc6eea006c8b9f322ac4fd
  @objc static func moduleName() -> String! {
    return "TeethClassifier"
  }

<<<<<<< HEAD
  // 메인 큐에서 초기화할 필요 없음
=======
  // 메인 스레드에서 초기화 여부 (대부분 false)
>>>>>>> 2433841413de3acf37bc6eea006c8b9f322ac4fd
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

<<<<<<< HEAD
  private var interpreter: Interpreter?
  private var inputWidth: Int = 224
  private var inputHeight: Int = 224
  private var inputChannels: Int = 3
  private var inputIsFloat: Bool = true
=======
  // TFLite 인터프리터
  private var interpreter: Interpreter?
>>>>>>> 2433841413de3acf37bc6eea006c8b9f322ac4fd

  override init() {
    super.init()
    loadModel()
  }

<<<<<<< HEAD
  // MARK: - 모델 로드

  private func loadModel() {
    guard let modelPath = Bundle.main.path(
      forResource: "teeth3_fp32",
      ofType: "tflite"
    ) else {
      print("❌ [TeethClassifier] TFLite model not found")
=======
  /// TFLite 모델 로드
  private func loadModel() {
    guard let modelPath = Bundle.main.path(
      forResource: "teeth3_dynamic",   // 또는 "teeth3_fp32" (실제 파일 이름과 맞추기)
      ofType: "tflite"
    ) else {
      print("❌ TFLite model not found")
>>>>>>> 2433841413de3acf37bc6eea006c8b9f322ac4fd
      return
    }

    do {
<<<<<<< HEAD
      let options = Interpreter.Options()
      interpreter = try Interpreter(modelPath: modelPath, options: options)
      try interpreter?.allocateTensors()

      // 입력 텐서 정보 디버깅
      if let inputTensor = try interpreter?.input(at: 0) {
        let dims = inputTensor.shape.dimensions  // [1, H, W, C] 라고 가정
        print("📐 [TeethClassifier] input tensor shape:", dims,
              "type:", inputTensor.dataType)   // ✅ 또는 String(describing: inputTensor.dataType)

        if dims.count == 4 {
          inputHeight = dims[1]
          inputWidth  = dims[2]
          inputChannels = dims[3]
        }
        inputIsFloat = (inputTensor.dataType == .float32)
      }

      print("✅ [TeethClassifier] Model loaded successfully")
    } catch {
      print("❌ [TeethClassifier] Failed to load model:", error)
    }
  }

  // MARK: - 전처리 유틸

  private func resizedImage(_ image: UIImage) -> UIImage? {
    let size = CGSize(width: inputWidth, height: inputHeight)
    UIGraphicsBeginImageContextWithOptions(size, false, 1.0)
    image.draw(in: CGRect(origin: .zero, size: size))
    let newImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return newImage
  }

  /// UIImage → (H,W,3) RGB Data (Float32 or UInt8)
  private func rgbData(from image: UIImage) -> Data? {
    guard let cgImage = image.cgImage else { return nil }

    let width = inputWidth
    let height = inputHeight
    let bytesPerPixel = 4
    let bytesPerRow = bytesPerPixel * width
    let bitsPerComponent = 8

    var rawBytes = [UInt8](repeating: 0, count: width * height * bytesPerPixel)

    guard let context = CGContext(
      data: &rawBytes,
      width: width,
      height: height,
      bitsPerComponent: bitsPerComponent,
      bytesPerRow: bytesPerRow,
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
      return nil
    }

    let rect = CGRect(x: 0, y: 0, width: width, height: height)
    context.draw(cgImage, in: rect)

    if inputIsFloat {
      // ✅ Float32 [-1,1] 로 정규화 (파이썬 preprocess_input 과 동일)
      var floats = [Float](repeating: 0, count: width * height * inputChannels)

      for i in 0..<(width * height) {
        let offset = i * bytesPerPixel

        // 0~255 → -1~1 : x / 127.5 - 1.0
        let r = (Float(rawBytes[offset])     / 127.5) - 1.0
        let g = (Float(rawBytes[offset + 1]) / 127.5) - 1.0
        let b = (Float(rawBytes[offset + 2]) / 127.5) - 1.0

        let outIndex = i * 3
        floats[outIndex    ] = r
        floats[outIndex + 1] = g
        floats[outIndex + 2] = b
      }

      return floats.withUnsafeBufferPointer { buffer in
        Data(buffer: buffer)
      }

    } else {
      // UInt8 (0~255) RGB – 이 부분은 그대로 두시면 됩니다
      var rgb = [UInt8](repeating: 0, count: width * height * inputChannels)

      for i in 0..<(width * height) {
        let offset = i * bytesPerPixel
        let outIndex = i * 3
        rgb[outIndex    ] = rawBytes[offset]
        rgb[outIndex + 1] = rawBytes[offset + 1]
        rgb[outIndex + 2] = rawBytes[offset + 2]
      }

      return rgb.withUnsafeBufferPointer { buffer in
        Data(buffer: buffer)
      }
    }
  }

  // MARK: - RN에서 호출하는 메서드

  @objc(infer:resolver:rejecter:)
  func infer(
    _ base64: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
=======
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
>>>>>>> 2433841413de3acf37bc6eea006c8b9f322ac4fd
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let interpreter = interpreter else {
      reject("no_interpreter", "Interpreter is not ready", nil)
      return
    }

<<<<<<< HEAD
    // 네이티브 작업은 백그라운드 큐에서 수행
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // 1) base64 → Data → UIImage
        guard
          let imageData = Data(
            base64Encoded: base64 as String,
            options: .ignoreUnknownCharacters
          ),
          let image = UIImage(data: imageData)
        else {
          reject("decode_error", "Failed to decode base64 image", nil)
          return
        }

        // 2) 모델 입력 크기로 리사이즈
        guard
          let resized = self.resizedImage(image),
          let inputData = self.rgbData(from: resized)
        else {
          reject("preprocess_error", "Failed to resize/preprocess image", nil)
          return
        }

        // 디버그용: 크기 출력
        if let inputTensor = try? interpreter.input(at: 0) {
          print(
            "📥 [TeethClassifier] inputData.count = \(inputData.count), " +
            "expected = \(inputTensor.data.count)"
          )
        }

        // 3) TFLite에 입력 복사 & 추론
        try interpreter.copy(inputData, toInputAt: 0)
        try interpreter.invoke()

        let outputTensor = try interpreter.output(at: 0)

        // 4) 결과 -> [Float32] 배열로 변환해서 RN으로 전달
        let scores: [Float32] = outputTensor.data.toArray(type: Float32.self)
        print("📊 [TeethClassifier] output scores =", scores)

        resolve(scores)
      } catch {
        print("❌ [TeethClassifier] Inference error:", error)
        reject("inference_failed", "Failed to run inference", error)
      }
=======
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
>>>>>>> 2433841413de3acf37bc6eea006c8b9f322ac4fd
    }
  }
}

<<<<<<< HEAD
// MARK: - Data → [T] 확장

extension Data {
  func toArray<T>(type: T.Type) -> [T] {
    let count = self.count / MemoryLayout<T>.stride
    return self.withUnsafeBytes { buffer in
      let ptr = buffer.bindMemory(to: T.self)
      return Array(ptr[0..<count])
=======
// MARK: - Data → [T] 변환 유틸
extension Data {
  /// Data를 제네릭 배열로 변환 (예: Float32.self)
  func toArray<T>(type: T.Type) -> [T] {
    let elementCount = self.count / MemoryLayout<T>.stride
    return self.withUnsafeBytes { bufferPointer in
      let ptr = bufferPointer.bindMemory(to: T.self)
      return Array(ptr[0..<elementCount])
>>>>>>> 2433841413de3acf37bc6eea006c8b9f322ac4fd
    }
  }
}

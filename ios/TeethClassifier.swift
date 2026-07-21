//
//  TeethClassifier.swift
//  BloomDent
//

import Foundation
import UIKit
import TensorFlowLite          // pod 'TensorFlowLiteSwift'
import React                  // RCTPromiseResolveBlock, RCTPromiseRejectBlock

@objc(TeethClassifier)
class TeethClassifier: NSObject {

  @objc static func moduleName() -> String! {
    return "TeethClassifier"
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  private var interpreter: Interpreter?
  private var inputWidth: Int = 224
  private var inputHeight: Int = 224
  private var inputChannels: Int = 3
  private var isFloatModel: Bool = true

  override init() {
    super.init()
    loadModel()
  }

  // MARK: - Load TFLite Model
  private func loadModel() {
    guard let modelPath = Bundle.main.path(
      forResource: "teeth3_fp32",   // 실제 파일 이름과 반드시 맞추기
      ofType: "tflite"
    ) else {
      print("❌ [TeethClassifier] TFLite model not found")
      return
    }

    do {
      let options = Interpreter.Options()
      interpreter = try Interpreter(modelPath: modelPath, options: options)
      try interpreter?.allocateTensors()

      // 입력 텐서 shape 파악
      if let inputTensor = try interpreter?.input(at: 0) {
        let dims = inputTensor.shape.dimensions
        print("📐 Input Tensor Shape:", dims, "Type:", inputTensor.dataType)

        if dims.count == 4 {
          inputHeight = dims[1]
          inputWidth  = dims[2]
          inputChannels = dims[3]
        }

        isFloatModel = (inputTensor.dataType == .float32)
      }

      print("✅ [TeethClassifier] Model loaded OK")

    } catch {
      print("❌ [TeethClassifier] Model load failed:", error)
    }
  }

  // MARK: - Image Preprocessing
  private func resize(_ image: UIImage) -> UIImage? {
    let size = CGSize(width: inputWidth, height: inputHeight)
    UIGraphicsBeginImageContextWithOptions(size, false, 1.0)
    image.draw(in: CGRect(origin: .zero, size: size))
    let resized = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return resized
  }

  private func rgbData(from image: UIImage) -> Data? {
    guard let cgImage = image.cgImage else { return nil }

    let width = inputWidth
    let height = inputHeight
    let bytesPerPixel = 4
    let bytesPerRow = width * bytesPerPixel
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
    ) else { return nil }

    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))

    if isFloatModel {
      // Float32 normalized [-1, 1]
      var floats = [Float](repeating: 0, count: width * height * 3)

      for i in 0 ..< width * height {
        let offset = i * bytesPerPixel
        let o = i * 3

        let r = (Float(rawBytes[offset])     / 127.5) - 1.0
        let g = (Float(rawBytes[offset + 1]) / 127.5) - 1.0
        let b = (Float(rawBytes[offset + 2]) / 127.5) - 1.0

        floats[o]     = r
        floats[o + 1] = g
        floats[o + 2] = b
      }

      return Data(buffer: UnsafeBufferPointer(start: &floats, count: floats.count))
    }

    return nil  // (UInt8 모델 필요 시 여기에 추가 작성 가능)
  }

  // MARK: - React Native Bridge
  @objc(infer:resolver:rejecter:)
  func infer(
    _ base64: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {

    guard let interpreter = interpreter else {
      reject("no_interpreter", "Interpreter not ready", nil)
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard
          let data = Data(base64Encoded: base64 as String),
          let image = UIImage(data: data)
        else {
          reject("decode_failed", "Failed to decode base64 image", nil)
          return
        }

        guard
          let resized = self.resize(image),
          let tensorData = self.rgbData(from: resized)
        else {
          reject("preprocess_failed", "Image preprocessing failed", nil)
          return
        }

        try interpreter.copy(tensorData, toInputAt: 0)
        try interpreter.invoke()

        let output = try interpreter.output(at: 0)
        let scores: [Float32] = output.data.toArray(type: Float32.self)

        resolve(scores)

      } catch {
        reject("inference_failed", "Failed during inference", error)
      }
    }
  }
}

// MARK: - Data to Array
extension Data {
  func toArray<T>(type: T.Type) -> [T] {
    let count = self.count / MemoryLayout<T>.stride
    return self.withUnsafeBytes {
      Array($0.bindMemory(to: T.self)[0..<count])
    }
  }
}
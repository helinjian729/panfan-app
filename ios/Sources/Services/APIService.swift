import Foundation
import Alamofire

// MARK: - API Configuration
struct APIConfig {
    static let baseURL = "http://localhost:3000/api/v1"

    struct Endpoints {
        // Auth
        static let sendCode = "/auth/send-code"
        static let login = "/auth/login"
        static let refresh = "/auth/refresh"

        // User
        static let profile = "/users/profile"

        // Restaurant
        static let restaurants = "/restaurants"
        static func restaurantDetail(_ id: String) -> String { "/restaurants/\(id)" }
        static func restaurantMenu(_ id: String) -> String { "/restaurants/\(id)/menu" }
        static func restaurantDiscount(_ id: String) -> String { "/restaurants/\(id)/discount-info" }

        // Group
        static let groups = "/groups"
        static let joinGroup = "/groups/join"
        static let nearbyGroups = "/groups/nearby"
        static func groupDetail(_ id: String) -> String { "/groups/\(id)" }
        static func groupItems(_ id: String) -> String { "/groups/\(id)/items" }
        static func groupCancel(_ id: String) -> String { "/groups/\(id)/cancel" }
        static func groupLeave(_ id: String) -> String { "/groups/\(id)/leave" }
        static func groupAddItem(_ id: String) -> String { "/groups/\(id)/items" }
        static func groupRemoveItem(_ id: String, _ itemId: String) -> String { "/groups/\(id)/items/\(itemId)" }
        static func groupCalculate(_ id: String) -> String { "/groups/\(id)/calculate" }

        // Order
        static let orders = "/orders"
        static func orderDetail(_ id: String) -> String { "/orders/\(id)" }
        static func orderPay(_ id: String) -> String { "/orders/\(id)/pay" }
        static func orderCancel(_ id: String) -> String { "/orders/\(id)/cancel" }
    }
}

// MARK: - API Response
struct APIResponse<T: Codable>: Codable {
    let code: Int
    let message: String
    let data: T?
    let timestamp: String?
}

// MARK: - API Error
enum APIError: Error {
    case networkError
    case serverError(String)
    case decodingError
    case unauthorized
    case notFound
}

// MARK: - API Service
class APIService {
    static let shared = APIService()
    private let session: Session

    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        session = Session(configuration: configuration)
    }

    // MARK: - Generic Request
    func request<T: Codable>(
        _ endpoint: String,
        method: HTTPMethod = .get,
        parameters: Parameters? = nil,
        encoding: ParameterEncoding = JSONEncoding.default,
        headers: HTTPHeaders? = nil
    ) async throws -> T {
        let url = APIConfig.baseURL + endpoint

        var requestHeaders = headers ?? HTTPHeaders()
        if let token = KeychainHelper.shared.getAccessToken() {
            requestHeaders.add(.authorization(bearerToken: token))
        }
        requestHeaders.add(.contentType("application/json"))

        return try await withCheckedThrowingContinuation { continuation in
            session.request(url, method: method, parameters: parameters, encoding: encoding, headers: requestHeaders)
                .validate()
                .responseDecodable(of: APIResponse<T>.self) { response in
                    switch response.result {
                    case .success(let apiResponse):
                        if apiResponse.code == 0, let data = apiResponse.data {
                            continuation.resume(returning: data)
                        } else {
                            continuation.resume(throwing: APIError.serverError(apiResponse.message))
                        }
                    case .failure(let error):
                        if let statusCode = response.response?.statusCode {
                            switch statusCode {
                            case 401:
                                continuation.resume(throwing: APIError.unauthorized)
                            case 404:
                                continuation.resume(throwing: APIError.notFound)
                            default:
                                continuation.resume(throwing: APIError.serverError(error.localizedDescription))
                            }
                        } else {
                            continuation.resume(throwing: APIError.networkError)
                        }
                    }
                }
        }
    }

    // MARK: - POST Request with Body
    func post<T: Codable, B: Encodable>(
        _ endpoint: String,
        body: B
    ) async throws -> T {
        let url = APIConfig.baseURL + endpoint

        var requestHeaders = HTTPHeaders()
        if let token = KeychainHelper.shared.getAccessToken() {
            requestHeaders.add(.authorization(bearerToken: token))
        }
        requestHeaders.add(.contentType("application/json"))

        let data = try JSONEncoder().encode(body)

        return try await withCheckedThrowingContinuation { continuation in
            var urlRequest = URLRequest(url: URL(string: url)!)
            urlRequest.httpMethod = "POST"
            urlRequest.httpBody = data
            urlRequest.headers = requestHeaders

            session.request(urlRequest)
                .validate()
                .responseDecodable(of: APIResponse<T>.self) { response in
                    switch response.result {
                    case .success(let apiResponse):
                        if apiResponse.code == 0, let data = apiResponse.data {
                            continuation.resume(returning: data)
                        } else {
                            continuation.resume(throwing: APIError.serverError(apiResponse.message))
                        }
                    case .failure(let error):
                        continuation.resume(throwing: APIError.serverError(error.localizedDescription))
                    }
                }
        }
    }
}

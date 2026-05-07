import Foundation
import KeychainAccess

class AuthService {
    static let shared = AuthService()
    private let keychain = KeychainHelper.shared

    private init() {}

    // MARK: - Send Code
    func sendCode(phone: String) async throws -> SendCodeResponse {
        let parameters = ["phone": phone]
        return try await APIService.shared.request(
            APIConfig.Endpoints.sendCode,
            method: .post,
            parameters: parameters
        )
    }

    // MARK: - Login
    func login(phone: String, code: String) async throws -> AuthResponse {
        let parameters = ["phone": phone, "code": code]
        return try await APIService.shared.request(
            APIConfig.Endpoints.login,
            method: .post,
            parameters: parameters
        )
    }

    // MARK: - Save Tokens
    func saveTokens(accessToken: String, refreshToken: String, user: User) {
        keychain.saveAccessToken(accessToken)
        keychain.saveRefreshToken(refreshToken)
        keychain.saveUser(user)
    }

    // MARK: - Logout
    func logout() {
        keychain.clearAll()
    }

    // MARK: - Check Login Status
    func isLoggedIn() -> Bool {
        return keychain.getAccessToken() != nil
    }

    // MARK: - Get Current User
    func getCurrentUser() -> User? {
        return keychain.getUser()
    }

    // MARK: - Refresh Token
    func refreshToken() async throws -> Bool {
        guard let refreshToken = keychain.getRefreshToken() else {
            return false
        }

        struct RefreshRequest: Codable {
            let refreshToken: String
        }

        struct RefreshResponse: Codable {
            let accessToken: String
            let refreshToken: String
        }

        let response: RefreshResponse = try await APIService.shared.request(
            APIConfig.Endpoints.refresh,
            method: .post,
            parameters: ["refreshToken": refreshToken]
        )

        keychain.saveAccessToken(response.accessToken)
        keychain.saveRefreshToken(response.refreshToken)
        return true
    }
}

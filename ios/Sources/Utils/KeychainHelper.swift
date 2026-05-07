import Foundation
import KeychainAccess

class KeychainHelper {
    static let shared = KeychainHelper()
    private let keychain = Keychain(service: "com.panfan.app")

    private let accessTokenKey = "access_token"
    private let refreshTokenKey = "refresh_token"
    private let userKey = "current_user"

    private init() {}

    // MARK: - Access Token
    func saveAccessToken(_ token: String) {
        try? keychain.set(token, key: accessTokenKey)
    }

    func getAccessToken() -> String? {
        return try? keychain.get(accessTokenKey)
    }

    // MARK: - Refresh Token
    func saveRefreshToken(_ token: String) {
        try? keychain.set(token, key: refreshTokenKey)
    }

    func getRefreshToken() -> String? {
        return try? keychain.get(refreshTokenKey)
    }

    // MARK: - User
    func saveUser(_ user: User) {
        if let data = try? JSONEncoder().encode(user) {
            try? keychain.set(data, key: userKey)
        }
    }

    func getUser() -> User? {
        guard let data = try? keychain.getData(userKey) else { return nil }
        return try? JSONDecoder().decode(User.self, from: data)
    }

    // MARK: - Clear All
    func clearAll() {
        try? keychain.remove(accessTokenKey)
        try? keychain.remove(refreshTokenKey)
        try? keychain.remove(userKey)
    }
}

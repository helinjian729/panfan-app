import Foundation

// MARK: - User
struct User: Codable, Identifiable {
    let id: String
    let phone: String
    let nickname: String
    let avatarUrl: String?

    enum CodingKeys: String, CodingKey {
        case id, phone, nickname, avatarUrl
    }
}

// MARK: - Auth Response
struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let user: User
}

// MARK: - Send Code Response
struct SendCodeResponse: Codable {
    let success: Bool
    let message: String
}

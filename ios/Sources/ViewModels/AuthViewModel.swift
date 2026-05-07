import Foundation
import SwiftUI

class AuthViewModel: ObservableObject {
    @Published var isLoggedIn = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let authService = AuthService.shared

    init() {
        checkLoginStatus()
    }

    func checkLoginStatus() {
        isLoggedIn = authService.isLoggedIn()
        currentUser = authService.getCurrentUser()
    }

    func sendCode(phone: String) async {
        await MainActor.run { isLoading = true }

        do {
            let _ = try await authService.sendCode(phone: phone)
            await MainActor.run {
                errorMessage = nil
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    func login(phone: String, code: String) async {
        await MainActor.run { isLoading = true }

        do {
            let response = try await authService.login(phone: phone, code: code)
            authService.saveTokens(
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                user: response.user
            )

            await MainActor.run {
                currentUser = response.user
                isLoggedIn = true
                isLoading = false
            }

            // Connect WebSocket
            WebSocketService.shared.connect(userId: response.user.id)
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    func logout() {
        authService.logout()
        WebSocketService.shared.disconnect()
        isLoggedIn = false
        currentUser = nil
    }
}

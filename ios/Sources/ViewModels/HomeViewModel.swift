import Foundation
import SwiftUI

class HomeViewModel: ObservableObject {
    @Published var myGroups: [Group] = []
    @Published var nearbyGroups: [Group] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func loadMyGroups() async {
        await MainActor.run { isLoading = true }

        do {
            let groups: [Group] = try await APIService.shared.request(APIConfig.Endpoints.groups)
            await MainActor.run {
                myGroups = groups
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    func loadNearbyGroups() async {
        do {
            let groups: [Group] = try await APIService.shared.request(APIConfig.Endpoints.nearbyGroups)
            await MainActor.run {
                nearbyGroups = groups
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
    }

    func refresh() async {
        await loadMyGroups()
        await loadNearbyGroups()
    }
}

import Foundation
import SwiftUI

class RestaurantViewModel: ObservableObject {
    @Published var restaurants: [Restaurant] = []
    @Published var currentRestaurant: Restaurant?
    @Published var menuItems: [MenuItem] = []
    @Published var categories: [String] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Load Restaurants
    func loadRestaurants(keyword: String? = nil, sort: String? = nil) async {
        await MainActor.run { isLoading = true }

        do {
            var endpoint = APIConfig.Endpoints.restaurants
            var params: [String] = []
            if let keyword = keyword, !keyword.isEmpty {
                params.append("keyword=\(keyword)")
            }
            if let sort = sort {
                params.append("sort=\(sort)")
            }
            if !params.isEmpty {
                endpoint += "?" + params.joined(separator: "&")
            }

            let restaurants: [Restaurant] = try await APIService.shared.request(endpoint)
            await MainActor.run {
                self.restaurants = restaurants
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    // MARK: - Load Restaurant Detail
    func loadRestaurantDetail(restaurantId: String) async {
        await MainActor.run { isLoading = true }

        do {
            let restaurant: Restaurant = try await APIService.shared.request(
                APIConfig.Endpoints.restaurantDetail(restaurantId)
            )
            await MainActor.run {
                currentRestaurant = restaurant
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    // MARK: - Load Menu
    func loadMenu(restaurantId: String) async {
        do {
            let items: [MenuItem] = try await APIService.shared.request(
                APIConfig.Endpoints.restaurantMenu(restaurantId)
            )

            await MainActor.run {
                menuItems = items
                // Extract categories
                let cats = Set(items.compactMap { $0.category })
                categories = Array(cats).sorted()
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
    }
}

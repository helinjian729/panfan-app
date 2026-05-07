import Foundation

// MARK: - Restaurant
struct Restaurant: Codable, Identifiable {
    let id: String
    let name: String
    let address: String?
    let phone: String?
    let rating: Double
    let deliveryFee: Double
    let minOrder: Double
    let discountInfo: [String: DiscountInfo]?
    let isActive: Bool

    var discountDescriptions: [String] {
        guard let info = discountInfo else { return [] }
        return info.map { "\($0.key) - 减\($0.value.discount)元" }
    }
}

struct DiscountInfo: Codable {
    let threshold: Double
    let discount: Double
}

// MARK: - MenuItem
struct MenuItem: Codable, Identifiable {
    let id: String
    let restaurantId: String
    let name: String
    let description: String?
    let price: Double
    let category: String?
    let imageUrl: String?
    let isAvailable: Bool
}

// MARK: - Menu Response
struct MenuResponse: Codable {
    let items: [MenuItem]
    let categories: [String]
}

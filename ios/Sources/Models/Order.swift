import Foundation

// MARK: - Order
struct Order: Codable, Identifiable {
    let id: String
    let groupId: String?
    let orderNo: String
    let totalAmount: Double
    let discountAmount: Double
    let finalAmount: Double
    let status: OrderStatus
    let payTime: Date?
    let deliveryTime: Date?
    let completedTime: Date?
    let createdAt: Date
    let items: [OrderItem]?
    let userItems: [OrderItem]?
    let userShare: Double?
}

enum OrderStatus: String, Codable {
    case PENDING
    case PAID
    case ACCEPTED
    case DELIVERING
    case DELIVERED
    case COMPLETED
    case REFUNDED

    var displayName: String {
        switch self {
        case .PENDING: return "待支付"
        case .PAID: return "已支付"
        case .ACCEPTED: return "已接单"
        case .DELIVERING: return "配送中"
        case .DELIVERED: return "已送达"
        case .COMPLETED: return "已完成"
        case .REFUNDED: return "已退款"
        }
    }
}

// MARK: - OrderItem
struct OrderItem: Codable, Identifiable {
    let id: String
    let orderId: String
    let userId: String
    let menuItemId: String?
    let name: String
    let price: Double
    let quantity: Int
    let remark: String?
    let user: User?
}

// MARK: - Create Order Request
struct CreateOrderRequest: Codable {
    let groupId: String?
}

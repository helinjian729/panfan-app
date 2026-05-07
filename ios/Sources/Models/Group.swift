import Foundation

// MARK: - Group
struct Group: Codable, Identifiable {
    let id: String
    let name: String
    let creatorId: String
    let restaurantId: String
    let targetCount: Int
    let currentCount: Int
    let status: GroupStatus
    let deadline: Date
    let inviteCode: String
    let totalAmount: Double
    let discountAmount: Double
    let finalAmount: Double
    let createdAt: Date
    let restaurant: Restaurant?
    let creator: User?
    let members: [GroupMember]?
    let items: [GroupOrderItem]?
    let discount: DiscountCalculation?
    let isCreator: Bool?

    enum CodingKeys: String, CodingKey {
        case id, name, creatorId, restaurantId, targetCount
        case currentCount, status, deadline, inviteCode
        case totalAmount, discountAmount, finalAmount, createdAt
        case restaurant, creator, members, items, discount, isCreator
    }
}

enum GroupStatus: String, Codable {
    case PENDING
    case SUCCESS
    case FAILED
    case CANCELLED
}

// MARK: - GroupMember
struct GroupMember: Codable, Identifiable {
    let id: String
    let groupId: String
    let userId: String
    let itemsAmount: Double
    let payAmount: Double
    let status: MemberStatus
    let joinedAt: Date
    let user: User?
}

enum MemberStatus: String, Codable {
    case JOINED
    case PAID
    case CANCELLED
}

// MARK: - GroupOrderItem
struct GroupOrderItem: Codable, Identifiable {
    let id: String
    let groupId: String
    let memberId: String
    let menuItemId: String?
    let name: String
    let price: Double
    let quantity: Int
    let remark: String?
    let createdAt: Date
    let member: GroupMember?
}

// MARK: - Discount Calculation
struct DiscountCalculation: Codable {
    let totalAmount: Double
    let currentDiscount: Double
    let finalAmount: Double
    let nextThreshold: ThresholdInfo?
    let thresholds: [ThresholdInfo]
    let isSatisfied: Bool
}

struct ThresholdInfo: Codable {
    let name: String
    let threshold: Double
    let discount: Double
}

// MARK: - Create Group Request
struct CreateGroupRequest: Codable {
    let name: String
    let restaurantId: String
    let targetCount: Int?
    let expireMinutes: Int?
}

// MARK: - Add Item Request
struct AddItemRequest: Codable {
    let menuItemId: String
    let quantity: Int?
    let remark: String?
}

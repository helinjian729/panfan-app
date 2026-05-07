import Foundation
import SwiftUI

class GroupViewModel: ObservableObject {
    @Published var currentGroup: Group?
    @Published var myGroups: [Group] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let webSocketService = WebSocketService.shared

    init() {
        setupWebSocket()
    }

    private func setupWebSocket() {
        webSocketService.onMemberJoin = { [weak self] groupId, userId in
            NotificationCenter.default.post(
                name: .memberJoined,
                object: nil,
                userInfo: ["groupId": groupId, "userId": userId]
            )
        }

        webSocketService.onMemberLeave = { [weak self] groupId, userId in
            NotificationCenter.default.post(
                name: .memberLeft,
                object: nil,
                userInfo: ["groupId": groupId, "userId": userId]
            )
        }

        webSocketService.onItemAdded = { [weak self] groupId, item in
            NotificationCenter.default.post(
                name: .itemAdded,
                object: nil,
                userInfo: ["groupId": groupId, "item": item]
            )
        }

        webSocketService.onItemRemoved = { [weak self] groupId, itemId in
            NotificationCenter.default.post(
                name: .itemRemoved,
                object: nil,
                userInfo: ["groupId": groupId, "itemId": itemId]
            )
        }

        webSocketService.onGroupStatusChange = { [weak self] groupId, status in
            NotificationCenter.default.post(
                name: .groupStatusChanged,
                object: nil,
                userInfo: ["groupId": groupId, "status": status]
            )
        }
    }

    // MARK: - Create Group
    func createGroup(name: String, restaurantId: String, targetCount: Int = 5, expireMinutes: Int = 30) async -> Group? {
        await MainActor.run { isLoading = true }

        do {
            let request = CreateGroupRequest(
                name: name,
                restaurantId: restaurantId,
                targetCount: targetCount,
                expireMinutes: expireMinutes
            )
            let group: Group = try await APIService.shared.post(APIConfig.Endpoints.groups, body: request)
            await MainActor.run {
                isLoading = false
            }
            return group
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
            return nil
        }
    }

    // MARK: - Join Group
    func joinGroup(inviteCode: String) async -> Group? {
        await MainActor.run { isLoading = true }

        do {
            struct JoinRequest: Codable {
                let inviteCode: String
            }
            let group: Group = try await APIService.shared.post(APIConfig.Endpoints.joinGroup, body: JoinRequest(inviteCode: inviteCode))
            await MainActor.run {
                isLoading = false
            }
            return group
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
            return nil
        }
    }

    // MARK: - Load Group Detail
    func loadGroupDetail(groupId: String) async {
        await MainActor.run { isLoading = true }

        do {
            let group: Group = try await APIService.shared.request(APIConfig.Endpoints.groupDetail(groupId))
            await MainActor.run {
                currentGroup = group
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    // MARK: - Add Item
    func addItem(groupId: String, menuItemId: String, quantity: Int = 1, remark: String? = nil) async {
        do {
            let request = AddItemRequest(menuItemId: menuItemId, quantity: quantity, remark: remark)
            let _: GroupOrderItem = try await APIService.shared.post(
                APIConfig.Endpoints.groupAddItem(groupId),
                body: request
            )
            await loadGroupDetail(groupId: groupId)
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
    }

    // MARK: - Remove Item
    func removeItem(groupId: String, itemId: String) async {
        do {
            let _: [String: String] = try await APIService.shared.request(
                APIConfig.Endpoints.groupRemoveItem(groupId, itemId),
                method: .delete
            )
            await loadGroupDetail(groupId: groupId)
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
    }

    // MARK: - Cancel Group
    func cancelGroup(groupId: String) async {
        do {
            let _: Group = try await APIService.shared.request(
                APIConfig.Endpoints.groupCancel(groupId),
                method: .post
            )
            await loadGroupDetail(groupId: groupId)
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
    }

    // MARK: - Leave Group
    func leaveGroup(groupId: String) async {
        do {
            let _: Group = try await APIService.shared.request(
                APIConfig.Endpoints.groupLeave(groupId),
                method: .post
            )
            await loadGroupDetail(groupId: groupId)
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let memberJoined = Notification.Name("memberJoined")
    static let memberLeft = Notification.Name("memberLeft")
    static let itemAdded = Notification.Name("itemAdded")
    static let itemRemoved = Notification.Name("itemRemoved")
    static let groupStatusChanged = Notification.Name("groupStatusChanged")
}

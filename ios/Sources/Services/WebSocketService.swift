import Foundation
import SocketIO

class WebSocketService {
    static let shared = WebSocketService()

    private var manager: SocketManager?
    private var socket: SocketIOClient?

    var onMemberJoin: ((String, String) -> Void)?
    var onMemberLeave: ((String, String) -> Void)?
    var onItemAdded: ((String, [String: Any]) -> Void)?
    var onItemRemoved: ((String, String) -> Void)?
    var onGroupStatusChange: ((String, String) -> Void)?
    var onCartUpdate: ((String, [String: Any]) -> Void)?

    private init() {}

    // MARK: - Connect
    func connect(userId: String) {
        let url = URL(string: "http://localhost:3000/groups")!
        manager = SocketManager(socketURL: url, config: [.log(false), .compress])
        socket = manager?.defaultSocket

        setupHandlers()
        socket?.connect()

        // Auth after connection
        socket?.once(clientEvent: .connect) { [weak self] _, _ in
            self?.socket?.emit("auth", ["userId": userId])
        }
    }

    // MARK: - Disconnect
    func disconnect() {
        socket?.disconnect()
        manager = nil
        socket = nil
    }

    // MARK: - Join Group
    func joinGroup(groupId: String, userId: String) {
        socket?.emit("join_group", ["groupId": groupId, "userId": userId])
    }

    // MARK: - Leave Group
    func leaveGroup(groupId: String, userId: String) {
        socket?.emit("leave_group", ["groupId": groupId, "userId": userId])
    }

    // MARK: - Emit Item Added
    func emitItemAdded(groupId: String, item: [String: Any]) {
        socket?.emit("item_added", ["groupId": groupId, "item": item])
    }

    // MARK: - Emit Item Removed
    func emitItemRemoved(groupId: String, itemId: String) {
        socket?.emit("item_removed", ["groupId": groupId, "itemId": itemId])
    }

    // MARK: - Emit Status Change
    func emitStatusChange(groupId: String, status: String) {
        socket?.emit("group_status_change", ["groupId": groupId, "status": status])
    }

    // MARK: - Emit Cart Update
    func emitCartUpdate(groupId: String, cart: [String: Any]) {
        socket?.emit("cart_update", ["groupId": groupId, "cart": cart])
    }

    // MARK: - Setup Handlers
    private func setupHandlers() {
        socket?.on("member_join") { [weak self] data, _ in
            if let dict = data[0] as? [String: Any],
               let groupId = dict["groupId"] as? String,
               let userId = dict["userId"] as? String {
                self?.onMemberJoin?(groupId, userId)
            }
        }

        socket?.on("member_leave") { [weak self] data, _ in
            if let dict = data[0] as? [String: Any],
               let groupId = dict["groupId"] as? String,
               let userId = dict["userId"] as? String {
                self?.onMemberLeave?(groupId, userId)
            }
        }

        socket?.on("item_added") { [weak self] data, _ in
            if let dict = data[0] as? [String: Any],
               let groupId = dict["groupId"] as? String,
               let item = dict["item"] as? [String: Any] {
                self?.onItemAdded?(groupId, item)
            }
        }

        socket?.on("item_removed") { [weak self] data, _ in
            if let dict = data[0] as? [String: Any],
               let groupId = dict["groupId"] as? String,
               let itemId = dict["itemId"] as? String {
                self?.onItemRemoved?(groupId, itemId)
            }
        }

        socket?.on("group_status_change") { [weak self] data, _ in
            if let dict = data[0] as? [String: Any],
               let groupId = dict["groupId"] as? String,
               let status = dict["status"] as? String {
                self?.onGroupStatusChange?(groupId, status)
            }
        }

        socket?.on("cart_update") { [weak self] data, _ in
            if let dict = data[0] as? [String: Any],
               let groupId = dict["groupId"] as? String,
               let cart = dict["cart"] as? [String: Any] {
                self?.onCartUpdate?(groupId, cart)
            }
        }
    }
}

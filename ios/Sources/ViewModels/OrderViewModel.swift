import Foundation
import SwiftUI

class OrderViewModel: ObservableObject {
    @Published var orders: [Order] = []
    @Published var currentOrder: Order?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Create Order
    func createOrder(groupId: String) async -> Order? {
        await MainActor.run { isLoading = true }

        do {
            let request = CreateOrderRequest(groupId: groupId)
            let order: Order = try await APIService.shared.post(APIConfig.Endpoints.orders, body: request)
            await MainActor.run {
                isLoading = false
            }
            return order
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
            return nil
        }
    }

    // MARK: - Load Orders
    func loadOrders() async {
        await MainActor.run { isLoading = true }

        do {
            let orders: [Order] = try await APIService.shared.request(APIConfig.Endpoints.orders)
            await MainActor.run {
                self.orders = orders
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    // MARK: - Load Order Detail
    func loadOrderDetail(orderId: String) async {
        await MainActor.run { isLoading = true }

        do {
            let order: Order = try await APIService.shared.request(APIConfig.Endpoints.orderDetail(orderId))
            await MainActor.run {
                currentOrder = order
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    // MARK: - Pay Order
    func payOrder(orderId: String, payMethod: String = "wechat") async -> Bool {
        await MainActor.run { isLoading = true }

        do {
            struct PayRequest: Codable {
                let payMethod: String
            }
            let _: Order = try await APIService.shared.post(
                APIConfig.Endpoints.orderPay(orderId),
                body: PayRequest(payMethod: payMethod)
            )
            await MainActor.run {
                isLoading = false
            }
            return true
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
            return false
        }
    }

    // MARK: - Cancel Order
    func cancelOrder(orderId: String) async -> Bool {
        do {
            let _: Order = try await APIService.shared.request(
                APIConfig.Endpoints.orderCancel(orderId),
                method: .post
            )
            await loadOrders()
            return true
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
            return false
        }
    }
}

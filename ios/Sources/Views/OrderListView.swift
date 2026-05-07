import SwiftUI

struct OrderListView: View {
    @StateObject private var viewModel = OrderViewModel()

    var body: some View {
        NavigationView {
            Group {
                if viewModel.orders.isEmpty && !viewModel.isLoading {
                    VStack(spacing: 16) {
                        Image(systemName: "bag")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("暂无订单")
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(viewModel.orders) { order in
                        NavigationLink(destination: OrderDetailView(orderId: order.id)) {
                            OrderRow(order: order)
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("订单")
            .refreshable {
                await viewModel.loadOrders()
            }
        }
        .onAppear {
            Task {
                await viewModel.loadOrders()
            }
        }
    }
}

// MARK: - Order Row
struct OrderRow: View {
    let order: Order

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("订单号: \(order.orderNo)")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                OrderStatusBadge(status: order.status)
            }

            HStack {
                Text(order.createdAt, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Text("¥\(order.finalAmount, specifier: "%.2f")")
                    .fontWeight(.semibold)
                    .foregroundColor(.orange)
            }

            if let items = order.items {
                Text(items.map { $0.name }.joined(separator: ", "))
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Order Status Badge
struct OrderStatusBadge: View {
    let status: OrderStatus

    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.2))
            .foregroundColor(statusColor)
            .cornerRadius(4)
    }

    var statusColor: Color {
        switch status {
        case .PENDING: return .orange
        case .PAID: return .blue
        case .ACCEPTED, .DELIVERING: return .purple
        case .DELIVERED, .COMPLETED: return .green
        case .REFUNDED: return .red
        }
    }
}

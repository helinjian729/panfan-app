import SwiftUI

struct OrderDetailView: View {
    let orderId: String
    @StateObject private var viewModel = OrderViewModel()
    @State private var showCancelAlert = false

    var body: some View {
        ScrollView {
            if let order = viewModel.currentOrder {
                VStack(spacing: 20) {
                    // Status Header
                    VStack(spacing: 12) {
                        Image(systemName: statusIcon(for: order.status))
                            .font(.system(size: 50))
                            .foregroundColor(statusColor(for: order.status))

                        Text(order.status.displayName)
                            .font(.title2)
                            .fontWeight(.semibold)

                        if let payTime = order.payTime {
                            Text("支付时间: \(payTime, style: .dateTime)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()

                    // Amount Info
                    VStack(spacing: 12) {
                        HStack {
                            Text("商品总价")
                            Spacer()
                            Text("¥\(order.totalAmount, specifier: "%.2f")")
                        }

                        HStack {
                            Text("满减优惠")
                            Spacer()
                            Text("-¥\(order.discountAmount, specifier: "%.2f")")
                                .foregroundColor(.green)
                        }

                        Divider()

                        HStack {
                            Text("实付金额")
                                .fontWeight(.semibold)
                            Spacer()
                            Text("¥\(order.finalAmount, specifier: "%.2f")")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.orange)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // Items
                    VStack(alignment: .leading, spacing: 12) {
                        Text("订单详情")
                            .font(.headline)

                        if let items = order.items {
                            ForEach(items) { item in
                                HStack {
                                    Text(item.name)
                                    Spacer()
                                    Text("x\(item.quantity)")
                                        .foregroundColor(.secondary)
                                    Text("¥\(item.price * Double(item.quantity), specifier: "%.2f")")
                                }
                                .padding(.vertical, 4)
                            }
                        }
                    }
                    .padding()

                    // Order Info
                    VStack(alignment: .leading, spacing: 8) {
                        Text("订单信息")
                            .font(.headline)

                        Text("订单号: \(order.orderNo)")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        Text("创建时间: \(order.createdAt, style: .dateTime)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()

                    // Actions
                    if order.status == .PENDING {
                        VStack(spacing: 12) {
                            Button(action: payOrder) {
                                Text("去支付")
                                    .fontWeight(.semibold)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.orange)
                                    .foregroundColor(.white)
                                    .cornerRadius(10)
                            }

                            Button(action: { showCancelAlert = true }) {
                                Text("取消订单")
                                    .foregroundColor(.red)
                            }
                        }
                        .padding()
                    }
                }
                .padding()
            } else if viewModel.isLoading {
                ProgressView()
                    .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .alert("取消订单", isPresented: $showCancelAlert) {
            Button("取消", role: .cancel) {}
            Button("确定取消", role: .destructive) {
                cancelOrder()
            }
        } message: {
            Text("确定要取消该订单吗？")
        }
        .onAppear {
            Task {
                await viewModel.loadOrderDetail(orderId: orderId)
            }
        }
    }

    func statusIcon(for status: OrderStatus) -> String {
        switch status {
        case .PENDING: return "clock.fill"
        case .PAID: return "checkmark.circle.fill"
        case .ACCEPTED: return "storefront.fill"
        case .DELIVERING: return "bicycle"
        case .DELIVERED: return "house.fill"
        case .COMPLETED: return "checkmark.seal.fill"
        case .REFUNDED: return "xmark.circle.fill"
        }
    }

    func statusColor(for status: OrderStatus) -> Color {
        switch status {
        case .PENDING: return .orange
        case .PAID: return .blue
        case .ACCEPTED, .DELIVERING: return .purple
        case .DELIVERED, .COMPLETED: return .green
        case .REFUNDED: return .red
        }
    }

    func payOrder() {
        Task {
            if await viewModel.payOrder(orderId: orderId) {
                await viewModel.loadOrderDetail(orderId: orderId)
            }
        }
    }

    func cancelOrder() {
        Task {
            if await viewModel.cancelOrder(orderId: orderId) {
                await viewModel.loadOrderDetail(orderId: orderId)
            }
        }
    }
}

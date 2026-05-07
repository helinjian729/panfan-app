import SwiftUI

struct GroupDetailView: View {
    let groupId: String
    @StateObject private var viewModel = GroupViewModel()
    @State private var showAddItem = false
    @State private var showPay = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let group = viewModel.currentGroup {
                    // Group Header
                    VStack(spacing: 12) {
                        Text(group.name)
                            .font(.title2)
                            .fontWeight(.bold)

                        StatusBadge(status: group.status)

                        if let restaurant = group.restaurant {
                            Text(restaurant.name)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()

                    // Discount Info
                    if let discount = group.discount {
                        VStack(spacing: 12) {
                            HStack {
                                Text("已选总价:")
                                Spacer()
                                Text("¥\(discount.totalAmount, specifier: "%.2f")")
                            }

                            HStack {
                                Text("满减优惠:")
                                Spacer()
                                Text("-¥\(discount.currentDiscount, specifier: "%.2f")")
                                    .foregroundColor(.green)
                            }

                            if !discount.isSatisfied, let next = discount.nextThreshold {
                                HStack {
                                    Image(systemName: "lightbulb.fill")
                                        .foregroundColor(.yellow)
                                    Text("再选¥\(next.threshold - discount.totalAmount, specifier: "%.2f")即可满足\(next.name)")
                                        .font(.caption)
                                        .foregroundColor(.orange)
                                }
                            }

                            Divider()

                            HStack {
                                Text("实付金额:")
                                    .fontWeight(.semibold)
                                Spacer()
                                Text("¥\(discount.finalAmount, specifier: "%.2f")")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.orange)
                            }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }

                    // Members
                    VStack(alignment: .leading, spacing: 12) {
                        Text("成员 (\(group.members?.count ?? 0))")
                            .font(.headline)

                        if let members = group.members {
                            ForEach(members) { member in
                                HStack {
                                    Circle()
                                        .fill(Color.orange.opacity(0.2))
                                        .frame(width: 40, height: 40)
                                        .overlay(
                                            Text(String(member.user?.nickname.prefix(1) ?? "?"))
                                                .foregroundColor(.orange)
                                        )

                                    VStack(alignment: .leading) {
                                        Text(member.user?.nickname ?? "未知")
                                            .fontWeight(.medium)
                                        Text("¥\(member.itemsAmount, specifier: "%.2f")")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }

                                    Spacer()

                                    if member.status == .JOINED {
                                        Text("待支付")
                                            .font(.caption)
                                            .foregroundColor(.orange)
                                    } else if member.status == .PAID {
                                        Text("已支付")
                                            .font(.caption)
                                            .foregroundColor(.green)
                                    }
                                }
                            }
                        }
                    }
                    .padding()

                    // Items
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("菜品清单")
                                .font(.headline)
                            Spacer()
                            Button("添加菜品") {
                                showAddItem = true
                            }
                            .font(.caption)
                            .foregroundColor(.orange)
                        }

                        if let items = group.items, !items.isEmpty {
                            ForEach(items) { item in
                                HStack {
                                    Text(item.name)
                                    Spacer()
                                    Text("x\(item.quantity)")
                                        .foregroundColor(.secondary)
                                    Text("¥\(item.price * Double(item.quantity), specifier: "%.2f")")
                                }
                                .padding(.vertical, 4)

                                if item.remark != nil {
                                    Text("备注: \(item.remark!)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        } else {
                            Text("暂无菜品")
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()

                    // Actions
                    VStack(spacing: 12) {
                        if group.status == .PENDING {
                            Button(action: { showPay = true }) {
                                Text("去支付")
                                    .fontWeight(.semibold)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.orange)
                                    .foregroundColor(.white)
                                    .cornerRadius(10)
                            }
                        }

                        if group.isCreator == true {
                            Button(action: cancelGroup) {
                                Text("取消拼饭团")
                                    .foregroundColor(.red)
                            }
                        } else {
                            Button(action: leaveGroup) {
                                Text("退出拼饭团")
                                    .foregroundColor(.red)
                            }
                        }
                    }
                    .padding()
                } else if viewModel.isLoading {
                    ProgressView()
                        .padding()
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showAddItem) {
            if let restaurantId = viewModel.currentGroup?.restaurantId {
                RestaurantMenuView(restaurantId: restaurantId, groupId: groupId)
            }
        }
        .onAppear {
            Task {
                await viewModel.loadGroupDetail(groupId: groupId)
            }
        }
        .refreshable {
            await viewModel.loadGroupDetail(groupId: groupId)
        }
    }

    private func cancelGroup() {
        Task {
            await viewModel.cancelGroup(groupId: groupId)
        }
    }

    private func leaveGroup() {
        Task {
            await viewModel.leaveGroup(groupId: groupId)
        }
    }
}

import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var showCreateGroup = false
    @State private var showJoinGroup = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Action Buttons
                    HStack(spacing: 16) {
                        Button(action: { showCreateGroup = true }) {
                            VStack(spacing: 8) {
                                Image(systemName: "plus.circle.fill")
                                    .font(.system(size: 40))
                                Text("发起拼饭")
                                    .font(.subheadline)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 20)
                            .background(Color.orange.opacity(0.1))
                            .cornerRadius(12)
                        }
                        .foregroundColor(.orange)

                        Button(action: { showJoinGroup = true }) {
                            VStack(spacing: 8) {
                                Image(systemName: "qrcode.viewfinder")
                                    .font(.system(size: 40))
                                Text("加入拼饭")
                                    .font(.subheadline)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 20)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(12)
                        }
                        .foregroundColor(.green)
                    }
                    .padding(.horizontal)

                    // My Groups
                    VStack(alignment: .leading, spacing: 12) {
                        Text("我的拼饭团")
                            .font(.headline)
                            .padding(.horizontal)

                        if viewModel.myGroups.isEmpty {
                            Text("暂无拼饭团")
                                .foregroundColor(.secondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                        } else {
                            ForEach(viewModel.myGroups) { group in
                                NavigationLink(destination: GroupDetailView(groupId: group.id)) {
                                    GroupCard(group: group)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }

                    // Nearby Groups
                    VStack(alignment: .leading, spacing: 12) {
                        Text("附近拼饭团")
                            .font(.headline)
                            .padding(.horizontal)

                        if viewModel.nearbyGroups.isEmpty {
                            Text("暂无附近拼饭团")
                                .foregroundColor(.secondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                        } else {
                            ForEach(viewModel.nearbyGroups) { group in
                                NavigationLink(destination: GroupDetailView(groupId: group.id)) {
                                    GroupCard(group: group)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("拼饭")
            .refreshable {
                await viewModel.refresh()
            }
            .sheet(isPresented: $showCreateGroup) {
                CreateGroupView()
            }
            .sheet(isPresented: $showJoinGroup) {
                JoinGroupView()
            }
        }
        .onAppear {
            Task {
                await viewModel.refresh()
            }
        }
    }
}

// MARK: - Group Card
struct GroupCard: View {
    let group: Group

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(group.name)
                    .font(.headline)
                    .foregroundColor(.primary)

                Spacer()

                StatusBadge(status: group.status)
            }

            HStack {
                if let restaurant = group.restaurant {
                    Label(restaurant.name, systemImage: "storefront")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Text("\(group.currentCount)/\(group.targetCount + 1)人")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            HStack {
                Label("\(group.inviteCode)", systemImage: "ticket")
                    .font(.caption)
                    .foregroundColor(.orange)

                Spacer()

                if group.finalAmount > 0 {
                    Text("¥\(group.finalAmount, specifier: "%.2f")")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.orange)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

// MARK: - Status Badge
struct StatusBadge: View {
    let status: GroupStatus

    var body: some View {
        Text(statusText)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.2))
            .foregroundColor(statusColor)
            .cornerRadius(4)
    }

    var statusText: String {
        switch status {
        case .PENDING: return "待成团"
        case .SUCCESS: return "已成团"
        case .FAILED: return "已失败"
        case .CANCELLED: return "已取消"
        }
    }

    var statusColor: Color {
        switch status {
        case .PENDING: return .blue
        case .SUCCESS: return .green
        case .FAILED: return .red
        case .CANCELLED: return .gray
        }
    }
}

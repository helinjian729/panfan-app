import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        NavigationView {
            List {
                // User Info Section
                Section {
                    HStack(spacing: 16) {
                        Circle()
                            .fill(Color.orange.opacity(0.2))
                            .frame(width: 60, height: 60)
                            .overlay(
                                Text(String(authViewModel.currentUser?.nickname.prefix(1) ?? "?"))
                                    .font(.title)
                                    .foregroundColor(.orange)
                            )

                        VStack(alignment: .leading, spacing: 4) {
                            Text(authViewModel.currentUser?.nickname ?? "用户")
                                .font(.headline)
                            Text(authViewModel.currentUser?.phone ?? "")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }

                // Settings Section
                Section(header: Text("设置")) {
                    NavigationLink(destination: Text("消息通知设置")) {
                        Label("消息通知", systemImage: "bell.fill")
                    }

                    NavigationLink(destination: Text("隐私设置")) {
                        Label("隐私", systemImage: "lock.fill")
                    }

                    NavigationLink(destination: Text("关于我们")) {
                        Label("关于我们", systemImage: "info.circle.fill")
                    }
                }

                // Logout Section
                Section {
                    Button(action: logout) {
                        HStack {
                            Spacer()
                            Text("退出登录")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("我的")
        }
    }

    func logout() {
        authViewModel.logout()
    }
}

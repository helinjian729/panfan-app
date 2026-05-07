import SwiftUI

struct JoinGroupView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var inviteCode = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var joinedGroup: Group?

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()

                VStack(spacing: 16) {
                    Image(systemName: "qrcode.viewfinder")
                        .font(.system(size: 80))
                        .foregroundColor(.orange)

                    Text("输入邀请码加入拼饭")
                        .font(.headline)

                    TextField("邀请码", text: $inviteCode)
                        .font(.system(size: 24, weight: .bold, design: .monospaced))
                        .multilineTextAlignment(.center)
                        .textCase(.uppercase)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                        .padding(.horizontal, 40)
                }

                Button(action: joinGroup) {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text("加入拼饭")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(inviteCode.count < 6 || isLoading)
                .padding(.horizontal, 24)

                Spacer()
            }
            .navigationTitle("加入拼饭")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }
            }
            .alert("加入失败", isPresented: $showError) {
                Button("确定", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
        }
    }

    private func joinGroup() {
        isLoading = true

        Task {
            let groupViewModel = GroupViewModel()
            if let group = await groupViewModel.joinGroup(inviteCode: inviteCode) {
                await MainActor.run {
                    joinedGroup = group
                    isLoading = false
                    dismiss()
                }
            } else {
                await MainActor.run {
                    errorMessage = groupViewModel.errorMessage ?? "加入失败"
                    isLoading = false
                    showError = true
                }
            }
        }
    }
}

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var phone = ""
    @State private var code = ""
    @State private var countdown = 0
    @State private var showError = false

    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()

                // Logo
                VStack(spacing: 10) {
                    Image(systemName: "fork.knife.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.orange)

                    Text("拼饭")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("和同事一起，午餐更划算")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // Phone Input
                VStack(alignment: .leading, spacing: 8) {
                    Text("手机号")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        TextField("请输入手机号", text: $phone)
                            .keyboardType(.phonePad)
                            .textContentType(.telephoneNumber)

                        Button(action: sendCode) {
                            Text(countdown > 0 ? "\(countdown)s" : "获取验证码")
                                .foregroundColor(countdown > 0 ? .gray : .orange)
                        }
                        .disabled(countdown > 0 || phone.count < 11)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                }

                // Code Input
                VStack(alignment: .leading, spacing: 8) {
                    Text("验证码")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    TextField("请输入验证码", text: $code)
                        .keyboardType(.numberPad)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                }

                // Login Button
                Button(action: login) {
                    HStack {
                        if authViewModel.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text("登录")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(phone.count < 11 || code.count < 6 || authViewModel.isLoading)

                Spacer()
            }
            .padding(.horizontal, 24)
            .navigationBarHidden(true)
            .alert("错误", isPresented: $showError) {
                Button("确定", role: .cancel) {}
            } message: {
                Text(authViewModel.errorMessage ?? "登录失败")
            }
        }
        .onReceive(timer) { _ in
            if countdown > 0 {
                countdown -= 1
            }
        }
    }

    private func sendCode() {
        Task {
            await authViewModel.sendCode(phone: phone)
            if authViewModel.errorMessage == nil {
                countdown = 60
            } else {
                showError = true
            }
        }
    }

    private func login() {
        Task {
            await authViewModel.login(phone: phone, code: code)
            if authViewModel.errorMessage != nil {
                showError = true
            }
        }
    }
}

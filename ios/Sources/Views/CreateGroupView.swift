import SwiftUI

struct CreateGroupView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var restaurantViewModel = RestaurantViewModel()
    @State private var groupName = ""
    @State private var selectedRestaurant: Restaurant?
    @State private var targetCount = 5
    @State private var expireMinutes = 30
    @State private var showRestaurantPicker = false
    @State private var showSuccess = false
    @State private var createdGroup: Group?

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("拼饭团信息")) {
                    TextField("拼饭团名称", text: $groupName)

                    Picker("选择商家", selection: $selectedRestaurant) {
                        Text("请选择商家").tag(nil as Restaurant?)
                        ForEach(restaurantViewModel.restaurants) { restaurant in
                            Text(restaurant.name).tag(restaurant as Restaurant?)
                        }
                    }
                    .onAppear {
                        Task {
                            await restaurantViewModel.loadRestaurants()
                        }
                    }

                    Stepper("目标人数: \(targetCount)人", value: $targetCount, in: 2...20)
                    Stepper("截止时间: \(expireMinutes)分钟", value: $expireMinutes, in: 5...120, step: 5)
                }

                if let restaurant = selectedRestaurant {
                    Section(header: Text("商家信息")) {
                        HStack {
                            Text(restaurant.name)
                            Spacer()
                            Text("配送费: ¥\(restaurant.deliveryFee)")
                                .foregroundColor(.secondary)
                        }

                        if !restaurant.discountDescriptions.isEmpty {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("满减优惠")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                ForEach(restaurant.discountDescriptions, id: \.self) { desc in
                                    Text("• \(desc)")
                                        .font(.caption)
                                }
                            }
                        }
                    }
                }

                Section {
                    Button(action: createGroup) {
                        HStack {
                            Spacer()
                            Text("发起拼饭")
                                .fontWeight(.semibold)
                            Spacer()
                        }
                    }
                    .disabled(groupName.isEmpty || selectedRestaurant == nil)
                }
            }
            .navigationTitle("发起拼饭")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showSuccess) {
                if let group = createdGroup {
                    NavigationView {
                        VStack(spacing: 20) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.green)

                            Text("拼饭团创建成功!")
                                .font(.title2)
                                .fontWeight(.semibold)

                            VStack(spacing: 10) {
                                Text("邀请码")
                                    .foregroundColor(.secondary)
                                Text(group.inviteCode)
                                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                                    .foregroundColor(.orange)
                            }
                            .padding()
                            .background(Color.orange.opacity(0.1))
                            .cornerRadius(12)

                            Text("分享邀请码给同事，一起凑单吧!")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            Button("进入拼饭团") {
                                dismiss()
                            }
                            .padding(.horizontal, 40)
                            .padding(.vertical, 12)
                            .background(Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .padding()
                    }
                }
            }
        }
    }

    private func createGroup() {
        guard let restaurant = selectedRestaurant else { return }

        Task {
            let groupViewModel = GroupViewModel()
            if let group = await groupViewModel.createGroup(
                name: groupName,
                restaurantId: restaurant.id,
                targetCount: targetCount,
                expireMinutes: expireMinutes
            ) {
                await MainActor.run {
                    createdGroup = group
                    showSuccess = true
                }
            }
        }
    }
}

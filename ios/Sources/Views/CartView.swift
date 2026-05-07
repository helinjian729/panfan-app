import SwiftUI

struct CartView: View {
    @Binding var cart: [CartItem]
    let restaurantId: String
    let groupId: String?
    let onComplete: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var isLoading = false

    var totalAmount: Double {
        cart.reduce(0) { $0 + $1.price * Double($1.quantity) }
    }

    var body: some View {
        NavigationView {
            VStack {
                if cart.isEmpty {
                    Text("购物车为空")
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(cart) { item in
                            HStack {
                                Text(item.name)

                                Spacer()

                                Text("¥\(item.price * Double(item.quantity), specifier: "%.2f")")
                                    .fontWeight(.medium)

                                HStack(spacing: 12) {
                                    Button(action: { decreaseQuantity(item) }) {
                                        Image(systemName: "minus.circle")
                                            .foregroundColor(.orange)
                                    }

                                    Text("\(item.quantity)")
                                        .frame(minWidth: 20)

                                    Button(action: { increaseQuantity(item) }) {
                                        Image(systemName: "plus.circle")
                                            .foregroundColor(.orange)
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    .listStyle(PlainListStyle())

                    VStack(spacing: 16) {
                        HStack {
                            Text("合计:")
                                .font(.headline)
                            Spacer()
                            Text("¥\(totalAmount, specifier: "%.2f")")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.orange)
                        }

                        Button(action: submitOrder) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Text("添加到拼饭团")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(isLoading)
                    }
                    .padding()
                }
            }
            .navigationTitle("购物车")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("清空") {
                        cart.removeAll()
                    }
                    .disabled(cart.isEmpty)
                }
            }
        }
    }

    func decreaseQuantity(_ item: CartItem) {
        if let index = cart.firstIndex(where: { $0.id == item.id }) {
            if cart[index].quantity > 1 {
                cart[index].quantity -= 1
            } else {
                cart.remove(at: index)
            }
        }
    }

    func increaseQuantity(_ item: CartItem) {
        if let index = cart.firstIndex(where: { $0.id == item.id }) {
            cart[index].quantity += 1
        }
    }

    func submitOrder() {
        guard let groupId = groupId else { return }

        isLoading = true

        Task {
            let groupViewModel = GroupViewModel()

            for item in cart {
                await groupViewModel.addItem(
                    groupId: groupId,
                    menuItemId: item.menuItemId,
                    quantity: item.quantity
                )
            }

            await MainActor.run {
                cart.removeAll()
                isLoading = false
                onComplete()
            }
        }
    }
}

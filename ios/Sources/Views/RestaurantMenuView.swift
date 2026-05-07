import SwiftUI

struct RestaurantMenuView: View {
    let restaurantId: String
    let groupId: String?
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = RestaurantViewModel()
    @State private var selectedCategory: String?
    @State private var cart: [CartItem] = []
    @State private var showCart = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if let restaurant = viewModel.currentRestaurant {
                    // Restaurant Info
                    VStack(alignment: .leading, spacing: 8) {
                        Text(restaurant.name)
                            .font(.title2)
                            .fontWeight(.bold)

                        HStack {
                            Text("⭐ \(restaurant.rating)")
                            Text("|")
                            Text("配送费 ¥\(restaurant.deliveryFee)")
                            Text("|")
                            Text("起送 ¥\(restaurant.minOrder)")
                        }
                        .font(.caption)
                        .foregroundColor(.secondary)

                        if !restaurant.discountDescriptions.isEmpty {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack {
                                    ForEach(restaurant.discountDescriptions, id: \.self) { desc in
                                        Text(desc)
                                            .font(.caption)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(Color.orange.opacity(0.1))
                                            .foregroundColor(.orange)
                                            .cornerRadius(4)
                                    }
                                }
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))

                    // Categories
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            Button(action: { selectedCategory = nil }) {
                                Text("全部")
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(selectedCategory == nil ? Color.orange : Color(.systemGray5))
                                    .foregroundColor(selectedCategory == nil ? .white : .primary)
                                    .cornerRadius(20)
                            }

                            ForEach(viewModel.categories, id: \.self) { category in
                                Button(action: { selectedCategory = category }) {
                                    Text(category)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(selectedCategory == category ? Color.orange : Color(.systemGray5))
                                        .foregroundColor(selectedCategory == category ? .white : .primary)
                                        .cornerRadius(20)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.vertical, 8)

                    // Menu Items
                    List {
                        ForEach(filteredItems) { item in
                            HStack(spacing: 12) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(item.name)
                                        .fontWeight(.medium)
                                    if let desc = item.description {
                                        Text(desc)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    Text("¥\(item.price, specifier: "%.2f")")
                                        .foregroundColor(.orange)
                                }

                                Spacer()

                                Button(action: { addToCart(item) }) {
                                    Image(systemName: "plus.circle.fill")
                                        .font(.title2)
                                        .foregroundColor(.orange)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    .listStyle(PlainListStyle())

                    // Cart Bar
                    if !cart.isEmpty {
                        HStack {
                            Text("\(cart.reduce(0) { $0 + $1.quantity }) 件")
                                .foregroundColor(.white)

                            Spacer()

                            Text("¥\(cart.reduce(0) { $0 + $1.price * Double($1.quantity) }, specifier: "%.2f")")
                                .fontWeight(.bold)
                                .foregroundColor(.white)

                            Button(action: { showCart = true }) {
                                Text("去结算")
                                    .fontWeight(.semibold)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 8)
                                    .background(Color.white)
                                    .foregroundColor(.orange)
                                    .cornerRadius(20)
                            }
                        }
                        .padding()
                        .background(Color.orange)
                    }
                } else if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("关闭") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                Task {
                    await viewModel.loadRestaurantDetail(restaurantId: restaurantId)
                    await viewModel.loadMenu(restaurantId: restaurantId)
                }
            }
            .sheet(isPresented: $showCart) {
                CartView(cart: $cart, restaurantId: restaurantId, groupId: groupId) {
                    dismiss()
                }
            }
        }
    }

    var filteredItems: [MenuItem] {
        if let category = selectedCategory {
            return viewModel.menuItems.filter { $0.category == category }
        }
        return viewModel.menuItems
    }

    func addToCart(_ item: MenuItem) {
        if let index = cart.firstIndex(where: { $0.menuItemId == item.id }) {
            cart[index].quantity += 1
        } else {
            cart.append(CartItem(menuItemId: item.id, name: item.name, price: item.price, quantity: 1))
        }
    }
}

// MARK: - Cart Item
struct CartItem: Identifiable {
    let id = UUID()
    let menuItemId: String
    let name: String
    let price: Double
    var quantity: Int
}

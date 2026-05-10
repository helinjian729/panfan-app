import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/restaurant/:id',
      name: 'Restaurant',
      component: () => import('@/views/RestaurantView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('@/views/CartView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/groups',
      name: 'Groups',
      component: () => import('@/views/GroupsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/group/:id',
      name: 'GroupDetail',
      component: () => import('@/views/GroupDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/group/create',
      name: 'CreateGroup',
      component: () => import('@/views/CreateGroupView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/group/join',
      name: 'JoinGroup',
      component: () => import('@/views/JoinGroupView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/order/:id',
      name: 'OrderDetail',
      component: () => import('@/views/OrderDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/order/confirm',
      name: 'OrderConfirm',
      component: () => import('@/views/OrderConfirmView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/addresses',
      name: 'AddressList',
      component: () => import('@/views/AddressListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/address/edit',
      name: 'AddressEdit',
      component: () => import('@/views/AddressEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/address/edit/:id',
      name: 'AddressEditWithId',
      component: () => import('@/views/AddressEditView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/home')
  } else {
    next()
  }
})

export default router

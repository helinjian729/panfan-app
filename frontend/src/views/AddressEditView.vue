<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAddress, createAddress, updateAddress } from '@/api/address'
import type { Address } from '@/api/address'

const router = useRouter()
const route = useRoute()

const isEditing = ref(false)
const addressId = ref<string | null>(null)
const isSaving = ref(false)

const form = ref({
  receiver: '',
  phone: '',
  province: '广东省',
  city: '深圳市',
  district: '南山区',
  detail: '',
  tag: '',
  isDefault: false,
})

const provinces = ['广东省', '北京市', '上海市', '浙江省', '江苏省']
const cities: Record<string, string[]> = {
  '广东省': ['深圳市', '广州市', '东莞市', '佛山市'],
  '北京市': ['北京市'],
  '上海市': ['上海市'],
  '浙江省': ['杭州市', '宁波市', '温州市'],
  '江苏省': ['南京市', '苏州市', '无锡市'],
}
const districts: Record<string, string[]> = {
  '深圳市': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'],
  '广州市': ['天河区', '越秀区', '海珠区', '白云区'],
  '东莞市': ['莞城区', '南城区', '东城区'],
  '佛山市': ['禅城区', '南海区', '顺德区'],
  '北京市': ['朝阳区', '海淀区', '东城区', '西城区'],
  '上海市': ['黄浦区', '徐汇区', '静安区', '浦东新区'],
  '杭州市': ['西湖区', '上城区', '拱墅区'],
  '宁波市': ['海曙区', '江北区', '鄞州区'],
  '温州市': ['鹿城区', '龙湾区', '瓯海区'],
  '南京市': ['玄武区', '秦淮区', '鼓楼区'],
  '苏州市': ['姑苏区', '虎丘区', '工业园区'],
  '无锡市': ['梁溪区', '锡山区', '惠山区'],
}

const cityOptions = ref<string[]>(cities[form.value.province] || [])
const districtOptions = ref<string[]>(districts[form.value.city] || [])

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    isEditing.value = true
    addressId.value = id
    try {
      const response = await getAddress(id)
      const addr: Address = response.data.data
      form.value = {
        receiver: addr.receiver,
        phone: addr.phone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        detail: addr.detail,
        tag: addr.tag || '',
        isDefault: addr.isDefault,
      }
      cityOptions.value = cities[form.value.province]?.length ? cities[form.value.province] : [form.value.city]
      districtOptions.value = districts[form.value.city]?.length ? districts[form.value.city] : [form.value.district]
    } catch (error) {
      console.error('Failed to load address:', error)
    }
  }
})

const onProvinceChange = () => {
  form.value.city = cityOptions.value[0] || ''
  form.value.district = ''
  cityOptions.value = cities[form.value.province] || []
  districtOptions.value = districts[form.value.city] || []
}

const onCityChange = () => {
  form.value.district = districtOptions.value[0] || ''
  districtOptions.value = districts[form.value.city] || []
}

const goBack = () => {
  router.back()
}

const handleSave = async () => {
  if (!form.value.receiver || !form.value.phone || !form.value.detail) {
    alert('请填写完整信息')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    alert('请输入正确的手机号')
    return
  }

  isSaving.value = true
  try {
    if (isEditing.value && addressId.value) {
      await updateAddress(addressId.value, form.value)
    } else {
      await createAddress(form.value)
    }
    router.back()
  } catch (error) {
    console.error('Failed to save address:', error)
    alert('保存失败')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="address-edit-page">
    <!-- Header -->
    <header class="header">
      <button class="header-back" @click="goBack">←</button>
      <h1 class="header-title">{{ isEditing ? '编辑地址' : '新增地址' }}</h1>
      <button class="header-save" :disabled="isSaving" @click="handleSave">
        {{ isSaving ? '保存中...' : '保存' }}
      </button>
    </header>

    <!-- Form -->
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">收货人</label>
        <input v-model="form.receiver" type="text" class="form-input" placeholder="请输入收货人姓名" />
      </div>

      <div class="form-group">
        <label class="form-label">联系电话</label>
        <input v-model="form.phone" type="tel" class="form-input" placeholder="请输入手机号" maxlength="11" pattern="1[3-9]\d{9}" />
      </div>

      <div class="form-group">
        <label class="form-label">所在地区</label>
        <div class="select-row">
          <select v-model="form.province" class="form-select" @change="onProvinceChange">
            <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
          </select>
          <select v-model="form.city" class="form-select" @change="onCityChange">
            <option v-for="c in cityOptions" :key="c" :value="c">{{ c }}</option>
          </select>
          <select v-model="form.district" class="form-select">
            <option v-for="d in districtOptions" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">详细地址</label>
        <input v-model="form.detail" type="text" class="form-input" placeholder="请输入详细地址" />
      </div>

      <div class="form-group">
        <label class="form-label">标签</label>
        <div class="tag-options">
          <button
            :class="['tag-btn', { active: form.tag === '家' }]"
            @click="form.tag = form.tag === '家' ? '' : '家'"
          >
            家
          </button>
          <button
            :class="['tag-btn', { active: form.tag === '公司' }]"
            @click="form.tag = form.tag === '公司' ? '' : '公司'"
          >
            公司
          </button>
          <button
            :class="['tag-btn', { active: form.tag === '学校' }]"
            @click="form.tag = form.tag === '学校' ? '' : '学校'"
          >
            学校
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">设为默认地址</label>
        <div class="switch-wrapper">
          <button
            :class="['switch', { active: form.isDefault }]"
            @click="form.isDefault = !form.isDefault"
          >
            <span class="switch-dot"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.address-edit-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  padding-bottom: var(--space-6);
}

/* Header */
.header {
  display: flex;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.header-back:hover {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
}

.header-save {
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-inverse);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.header-save:hover:not(:disabled) {
  background: #5558E3;
}

.header-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form Section */
.form-section {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.form-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
}

.form-input {
  width: 100%;
  padding: var(--space-2) 0;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.select-row {
  display: flex;
  gap: var(--space-2);
}

.form-select {
  flex: 1;
  padding: var(--space-2);
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
}

.tag-options {
  display: flex;
  gap: var(--space-2);
}

.tag-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-btn.active {
  border-color: var(--color-accent);
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
}

.switch-wrapper {
  display: flex;
  align-items: center;
}

.switch {
  width: 48px;
  height: 28px;
  background: var(--bg-tertiary);
  border: none;
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.switch.active {
  background: var(--color-accent);
}

.switch-dot {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: var(--text-inverse);
  border-radius: 50%;
  transition: transform var(--transition-fast);
}

.switch.active .switch-dot {
  transform: translateX(20px);
}
</style>
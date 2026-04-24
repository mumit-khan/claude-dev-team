<template>
  <div class="telus-footer">
    <img :src="$slidev.configs.language === 'fr' ? '/images/telus-logo-fr.png' : '/images/telus-logo-en.png'" class="footer-logo" />
    <span class="footer-title">{{ $slidev.configs.title }}</span>
    <span class="footer-right">TELUS {{ $slidev.configs.confidentiality ?? 'Proprietary' }} &nbsp;&middot;&nbsp; {{ $nav.currentPage }} / {{ $nav.total }}</span>
  </div>
</template>

<style>
.telus-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 40px;
  border-top: 1px solid #E3E6E8;
  background: #FFFFFF;
  font-size: 0.75em;
  color: #676E73;
  z-index: 100;
}
.footer-logo {
  height: 20px;
}
.footer-title {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 12px;
}
</style>

const MAP_URL = 'https://maps.google.com/maps?vet=10CAAQoqAOahcKEwiQ-LKO-KeWAxUAAAAAHQAAAAAQCQ..i&rlz=1C1GCHV_enGB1122GB1122&pvq=Cg0vZy8xMWZrZGpfYmJqIhMKDXVuaXQgNiBnYXJhZ2UQAhgD&lqi=ChV1bml0IDYgcmVkZGlzaCBnYXJhZ2VI0NK-yMWtgIAIWiEQABABEAMYABgBIhV1bml0IDYgcmVkZGlzaCBnYXJhZ2WSAQpjYXJfcmVwYWlymgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDJwb2FGVnVUbmRUTVVVelZFaHNRbUpWVFRCalIwNVlVbXBTVTA1SFl4QUL6AQQISRBL&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=uk&sa=X&ftid=0x487bb3f97f0772c3:0xc68f322e8763f4bb'
const ADDRESS = 'Unit 6, Station Road Industrial Estate, Station Road, Reddish, Stockport, SK5 6ND'
const PHONE = '07507541832'
const EMAIL = 'mhrautoservices@hotmail.co.uk'
const CONTACT = 'Andrew Ormrod'

function updateContactPage() {
  const details = document.querySelector('.contact-details')
  if (!details) return

  const blocks = details.querySelectorAll('.detail')
  if (blocks.length >= 3) {
    const address = blocks[0].querySelector('strong')
    if (address && address.dataset.mhrUpdated !== '1') {
      const link = document.createElement('a')
      link.href = MAP_URL
      link.target = '_blank'
      link.rel = 'noreferrer'
      link.textContent = ADDRESS
      link.style.color = 'inherit'
      link.style.textDecoration = 'underline'
      address.replaceChildren(link)
      address.dataset.mhrUpdated = '1'
    }

    const phone = blocks[1].querySelector('strong')
    if (phone && phone.dataset.mhrUpdated !== '1') {
      const link = document.createElement('a')
      link.href = `tel:${PHONE}`
      link.textContent = PHONE
      link.style.color = 'inherit'
      link.style.textDecoration = 'underline'
      phone.replaceChildren(link)
      phone.dataset.mhrUpdated = '1'
    }

    const email = blocks[2].querySelector('strong')
    if (email && email.dataset.mhrUpdated !== '1') {
      const link = document.createElement('a')
      link.href = `mailto:${EMAIL}`
      link.textContent = EMAIL
      link.style.color = 'inherit'
      link.style.textDecoration = 'underline'
      email.replaceChildren(link)
      email.dataset.mhrUpdated = '1'
    }
  }

  if (!details.querySelector('[data-mhr-contact-person]')) {
    const block = document.createElement('div')
    block.className = 'detail'
    block.dataset.mhrContactPerson = '1'
    block.innerHTML = `<div><span>Contact</span><strong>${CONTACT}</strong></div>`
    details.insertBefore(block, details.querySelector('.socials'))
  }

  details.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.href = `mailto:${EMAIL}`
  })

  const map = document.querySelector('.map-placeholder')
  if (map && map.dataset.mhrUpdated !== '1') {
    map.innerHTML = `<a href="${MAP_URL}" target="_blank" rel="noreferrer"><div><strong>Workshop location</strong><span>${ADDRESS}</span><span>Open in Google Maps</span></div></a>`
    map.dataset.mhrUpdated = '1'
  }
}

const observer = new MutationObserver(updateContactPage)
observer.observe(document.documentElement, { childList: true, subtree: true })
updateContactPage()

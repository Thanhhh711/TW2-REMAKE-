import QRCode from 'react-qr-code'

export default function QrCodeComponent() {
  // Đổi tên component để tránh xung đột
  const imageUrl = 'https://youtu.be/jsJ2r98AoTU?si=AvKWOdv0m1ym7z18'

  return (
    <div className='flex flex-col items-center space-y-4'>
      <h1 className='text-xl font-bold text-red-400'>Mã QR cho hình ảnh</h1>
      {/* Mã QR */}
      <QRCode value={imageUrl} size={200} />
      <p className='text-sm text-gray-500'>Quét mã QR để xem hình ảnh.</p>
    </div>
  )
}

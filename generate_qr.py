import qrcode

# QRコードにエンコードするデータ (フロントエンドのURL)
data = "http://localhost:5174/"

# QRコードを生成
img = qrcode.make(data)

# 画像ファイルとして保存
img.save("myskin_website_qr.png")

print(f"QRコードを 'myskin_website_qr.png' として保存しました。")
print(f"URL: {data}")

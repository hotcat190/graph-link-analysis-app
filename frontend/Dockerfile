FROM node:22.22.2-alpine3.22

WORKDIR /app

# Chỉ copy package.json (không copy package-lock.json và node_modules)
COPY package.json ./

# Chạy cài đặt - lúc này nó sẽ tạo ra node_modules mới bên trong container
RUN npm install

# Sau khi install xong mới copy toàn bộ code còn lại vào
# Lúc này lệnh COPY . . sẽ bỏ qua node_modules nhờ file .dockerignore ở bước 1
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
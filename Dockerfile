FROM node:13
RUN apt-get -y update && apt-get -y install graphicsmagick tesseract-ocr
WORKDIR /usr/src/app
COPY package*.json ./
ENV debug "true"
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "booking.js"]

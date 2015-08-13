FROM library/node:0.10

RUN apt-get update && apt-get install -y npm git

WORKDIR /home

EXPOSE 6061

CMD git clone -b product https://github.com/MaayanLab/amp-public.git \
	&& cd amp-public \
	&& npm install \
	&& npm install -g bower \
	&& npm install -g grunt-cli \
	&& bower -F install --allow-root \
	&& node index.js

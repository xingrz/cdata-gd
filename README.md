[C-DATA](https://cdata.xingrz.me/)
==========

[![license][license-img]][license-url] [![issues][issues-img]][issues-url] [![commits][commits-img]][commits-url]

一个开源的新冠疫情数据可视化项目。

## 功能

* 指定时间段的新增数折线图
* 指定时间段各街道（镇）的新增在地图上的位置及增量

## 开发

```sh
git clone https://github.com/xingrz/cdata-gd.git
cd cdata-gd
git clone https://github.com/xingrz/cdata-gd.git -b data data
npm -w @cdata/web install
npm -w @cdata/web run script scripts/build-data.ts
npm -w @cdata/web run dev
```

## 移植

若想将本项目用于展示其它城市的数据，可参考 `packages/bots` 重新实现数据抓取。

## 相关链接

本项目主要使用了以下开源组件：

* [AntV G2Plot](https://github.com/antvis/G2Plot)
* [AntV L7Plot](https://github.com/antvis/L7Plot)
* [Ant Design Vue](https://github.com/vueComponent/ant-design-vue)

## 开源协议

[MIT License](LICENSE)

[license-img]: https://img.shields.io/github/license/xingrz/cdata-gd?style=flat-square
[license-url]: LICENSE
[issues-img]: https://img.shields.io/github/issues/xingrz/cdata-gd?style=flat-square
[issues-url]: https://github.com/xingrz/cdata-gd/issues
[commits-img]: https://img.shields.io/github/last-commit/xingrz/cdata-gd?style=flat-square
[commits-url]: https://github.com/xingrz/cdata-gd/commits/master

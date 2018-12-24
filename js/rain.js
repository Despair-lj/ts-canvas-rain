"use strict";
{
    class Canvas {
        constructor(init) {
            this.windowWidth = 0;
            this.windowHeight = 0;
            this.anotherResizeName = 'optimizedResize';
            const { id, size, count, backgroundColor } = Object.assign({}, {
                id: 'rain',
                size: 2,
                count: 30,
                backgroundColor: 'rgba(0,0,0,0.1)'
            }, init);
            this.canvas = document.getElementById(id);
            this.ctx = this.canvas.getContext('2d');
            this.size = size;
            this.count = count;
            this.backgroundColor = backgroundColor;
            this.rains = [];
            this.resetCanvas();
            this.throttle('resize', this.anotherResizeName);
            window.addEventListener(this.anotherResizeName, () => {
                this.resetCanvas();
            });
            for (let i = 0; i < this.count; i++) {
                const rainInfo = {
                    rainX: this.random(0, this.windowWidth),
                    rainY: this.random(0, 0.1 * this.windowHeight),
                    rainVelocityY: this.random(4, 6),
                    color: 'rgb(0,255,255)',
                    rainYMax: this.random(0.8 * this.windowHeight, 0.9 * this.windowHeight)
                };
                const rain = new Rain(rainInfo);
                this.rains.push(rain);
            }
            this.animate();
        }
        drawRain(info) {
            if (info.isBottom === true) {
                const { rainX, rainY, halfLength, halfWidth, color } = info;
                this.ctx.beginPath();
                this.ctx.moveTo(rainX, rainY - halfLength);
                // 绘制右边椭圆弧
                this.ctx.bezierCurveTo(rainX + halfWidth, rainY - halfLength, rainX + halfWidth, rainY + halfLength, rainX, rainY + halfLength);
                // 绘制左边椭圆弧
                this.ctx.bezierCurveTo(rainX - halfWidth, rainY + halfLength, rainX - halfWidth, rainY - halfLength, rainX, rainY - halfLength);
                this.ctx.strokeStyle = color;
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else {
                const { rainX, rainY, color } = info;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(rainX, rainY, this.size, this.size * 3);
            }
        }
        clearCanvas(color) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, this.windowWidth, this.windowHeight);
        }
        animate() {
            this.clearCanvas(this.backgroundColor);
            this.rains.forEach(rain => {
                const rainInfo = rain.draw();
                this.drawRain(rainInfo);
                if (rain.update()) {
                    const rainInfo = {
                        rainX: this.random(0, this.windowWidth),
                        rainY: this.random(0, 0.1 * this.windowHeight),
                        rainVelocityY: this.random(4, 6),
                        color: 'rgb(0,255,255)',
                        rainYMax: this.random(0.8 * this.windowHeight, 0.9 * this.windowHeight)
                    };
                    rain.init(rainInfo);
                }
            });
            requestAnimationFrame(() => this.animate());
        }
        resetCanvas() {
            this.windowWidth = this.canvas.width = window.innerWidth;
            this.windowHeight = this.canvas.height = window.innerHeight;
        }
        random(min, max) {
            return Math.random() * (max - min) + min;
        }
        throttle(type, name, obj = window) {
            let running = false;
            const func = function () {
                if (running) {
                    return;
                }
                running = true;
                requestAnimationFrame(function () {
                    obj.dispatchEvent(new CustomEvent(name));
                    running = false;
                });
            };
            obj.addEventListener(type, func);
        }
    }
    class Rain {
        constructor(init) {
            // 雨滴下落时候的数据
            this.rainX = 0;
            this.rainY = 0;
            this.rainVelocityY = 0;
            this.color = 'rgb(0,255,255)';
            this.rainYMax = 0;
            // 水滴扩散椭圆的数据
            this.length = 1;
            this.width = 3;
            this.opacity = 1;
            this.velocityLength = 1.2;
            this.velocityWidth = 3;
            this.velocityOpacity = 0.01;
            this.init(init);
        }
        init(initInfo) {
            const { rainX, rainY, rainVelocityY, color, rainYMax, length, width, opacity, velocityLength, velocityWidth } = Object.assign({}, {
                rainX: 0,
                rainY: 0,
                rainVelocityY: 0,
                color: 'rgb(0,255,255)',
                rainYMax: 1,
                length: 1,
                width: 3,
                opacity: 1,
                velocityLength: 1.2,
                velocityWidth: 3
            }, initInfo);
            this.rainX = rainX;
            this.rainY = rainY;
            this.rainVelocityY = rainVelocityY;
            this.color = color;
            this.rainYMax = rainYMax;
            this.length = length;
            this.width = width;
            this.opacity = opacity;
            this.velocityLength = velocityLength;
            this.velocityWidth = velocityWidth;
        }
        draw() {
            // 下落到最低，水滴扩散效果
            if (this.rainY > this.rainYMax) {
                const color = `rgba(0, 255, 255, ${this.opacity})`;
                const halfLength = this.length / 2;
                const halfWidth = this.width / 2;
                return {
                    rainX: this.rainX,
                    rainY: this.rainY,
                    halfLength,
                    halfWidth,
                    color,
                    isBottom: true
                };
            }
            else {
                return {
                    rainX: this.rainX,
                    rainY: this.rainY,
                    color: this.color,
                    halfLength: 0,
                    halfWidth: 0,
                    isBottom: false
                };
            }
        }
        // 返回一个判断，是否要重制 rain 的数据
        update() {
            if (this.rainY > this.rainYMax) {
                if (this.opacity > 0) {
                    this.length += this.velocityLength;
                    this.width += this.velocityWidth;
                    this.opacity -= this.velocityOpacity;
                    this.velocityLength -= 0.01;
                    this.velocityWidth -= 0.01;
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                this.rainY += this.rainVelocityY;
                return false;
            }
        }
    }
    new Canvas({ id: 'rain' });
}

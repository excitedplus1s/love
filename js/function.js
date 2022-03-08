var RENDERER = {
            SNOW_COUNT: {
                INIT: 0,
                DELTA: 1
            },
            BACKGROUND_COLOR: 'hsl(%h, 50%, %l%)',
            INIT_HUE: 180,
            DELTA_HUE: 0.1,

            init: function() {
                this.setParameters();
                this.reconstructMethod();
                this.createSnow(this.SNOW_COUNT.INIT * this.countRate, true);
                this.render();
            },
            setParameters: function() {
                this.$window = $(window);

                this.$container = $('#nm-container');
                this.width = this.$container.width();
                this.height = this.$container.height();
                this.center = {
                    x: this.width / 2,
                    y: this.height / 2
                };
                this.countRate = this.width * this.height / 500 / 500;
                this.canvas = $('<canvas />').attr({
                    width: this.width,
                    height: this.height
                }).appendTo(this.$container).get(0);
                this.context = this.canvas.getContext('2d');

                this.radius = Math.sqrt(this.center.x * this.center.x + this.center.y * this.center.y);
                this.hue = this.INIT_HUE;
                this.snows = [];
            },
            reconstructMethod: function() {
                this.render = this.render.bind(this);
            },
            createSnow: function(count, toRandomize) {
                for (var i = 0; i < count; i++) {
                    this.snows.push(new SNOW(this.width, this.height, this.center, toRandomize));
                }
            },
            render: function() {
                requestAnimationFrame(this.render);

                var gradient = this.context.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, this.radius),
                    backgroundColor = this.BACKGROUND_COLOR.replace('%h', this.hue);

                gradient.addColorStop(0, backgroundColor.replace('%l', 30));
                gradient.addColorStop(0.2, backgroundColor.replace('%l', 20));
                gradient.addColorStop(1, backgroundColor.replace('%l', 5));

                this.context.fillStyle = gradient;
                this.context.fillRect(0, 0, this.width, this.height);

                for (var i = this.snows.length - 1; i >= 0; i--) {
                    if (!this.snows[i].render(this.context)) {
                        this.snows.splice(i, 1);
                    }
                }
                this.hue += this.DELTA_HUE;
                this.hue %= 360;

                this.createSnow(this.SNOW_COUNT.DELTA, false);
            }
        };
        var SNOW = function(width, height, center, toRandomize) {
            this.width = width;
            this.height = height;
            this.center = center;
            this.init(toRandomize);
        };
        SNOW.prototype = {
            RADIUS: 20,
            OFFSET: 4,
            INIT_POSITION_MARGIN: 20,
            COLOR: 'rgba(255, 255, 255, 0.8)',
            TOP_RADIUS: {
                MIN: 1,
                MAX: 3
            },
            SCALE: {
                INIT: 0.2,
                DELTA: 0.01,
                MAX: 3
            },
            DELTA_ROTATE: {
                MIN: -Math.PI / 180 / 2,
                MAX: Math.PI / 180 / 2
            },
            THRESHOLD_TRANSPARENCY: 2.1,
            VELOCITY: {
                MIN: -1,
                MAX: 1
            },
            LINE_WIDTH: 2,
            BLUR: 5,

            init: function(toRandomize) {
                this.setParameters(toRandomize);
                this.createSnow();
            },
            setParameters: function(toRandomize) {
                if (!this.canvas) {
                    this.radius = this.RADIUS + this.TOP_RADIUS.MAX * 2 + this.LINE_WIDTH;
                    this.length = this.radius * 2;
                    this.canvas = $('<canvas />').attr({
                        width: this.length,
                        height: this.length
                    }).get(0);
                    this.context = this.canvas.getContext('2d');
                }
                this.topRadius = this.getRandomValue(this.TOP_RADIUS);

                var theta = Math.PI * 2 * Math.random();

                this.x = this.center.x + this.INIT_POSITION_MARGIN * Math.cos(theta);
                this.y = this.center.y + this.INIT_POSITION_MARGIN * Math.sin(theta);
                this.vx = this.getRandomValue(this.VELOCITY);
                this.vy = this.getRandomValue(this.VELOCITY);

                this.deltaRotate = this.getRandomValue(this.DELTA_ROTATE);
                this.scale = this.SCALE.INIT;
                this.deltaScale = 1 + this.SCALE.DELTA * 500 / Math.max(this.width, this.height);
                this.rotate = 0;

                if (toRandomize) {
                    for (var i = 0, count = Math.random() * 1000; i < count; i++) {
                        this.x += this.vx;
                        this.y += this.vy;
                        this.scale *= this.deltaScale;
                        this.rotate += this.deltaRotate;
                    }
                }
            },
            getRandomValue: function(range) {
                return range.MIN + (range.MAX - range.MIN) * Math.random();
            },
            createSnow: function() {
                this.context.clearRect(0, 0, this.length, this.length);

                this.context.save();
                this.context.beginPath();
                this.context.translate(this.radius, this.radius);
                this.context.shadowColor = this.COLOR;
                this.context.shadowBlur = this.BLUR;

                this.context.fillText('🎂', 0, 0);
                this.context.stroke();
                this.context.restore();
            },
            render: function(context) {
                context.save();

                if (this.scale > this.THRESHOLD_TRANSPARENCY) {
                    context.globalAlpha = Math.max(0, (this.SCALE.MAX - this.scale) / (this.SCALE.MAX - this.THRESHOLD_TRANSPARENCY));

                    if (this.scale > this.SCALE.MAX || this.x < -this.radius || this.x > this.width + this.radius || this.y < -this.radius || this.y > this.height + this.radius) {
                        context.restore();
                        return false;
                    }
                }
                context.translate(this.x, this.y);
                context.rotate(this.rotate);
                context.scale(this.scale, this.scale);
                context.drawImage(this.canvas, -this.radius, -this.radius);
                context.restore();

                this.x += this.vx;
                this.y += this.vy;
                this.scale *= this.deltaScale;
                this.rotate += this.deltaRotate;
                return true;
            }
        };

        $(function() {
            RENDERER.init();
        });
        function timer() {
          var start = new Date("2019-05-21 00:00:00").getTime(); // 2015.7.2
          var t = new Date().getTime() - start; 
            var h = ~~(t / 1000 / 60 / 60 % 24);
            if (h < 10) {
                h = "0" + h;
            }
            var m = ~~(t / 1000 / 60 % 60);
            if (m < 10) {
                m = "0" + m;
            }
            var s = ~~(t / 1000 % 60);
            if (s < 10) {
                s = "0" + s;
            }
            document.getElementById('d').innerHTML = ~~(t / 1000 / 60 / 60 / 24);
            document.getElementById('h').innerHTML = h;
            document.getElementById('m').innerHTML = m;
            document.getElementById('s').innerHTML = s;
        }
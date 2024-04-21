const building01_front_color = "#231D52"
const building01_side_color = "#D65399"

class BuildingV1 {
    constructor(x, y, color_pick=1, b_width=50, b_length=30, front_angle=7, side_angle=30) {
        console.log("constructing building");
        this.x_origin = x;
        this.x_i = x;
        this.y_i = y;
        this.width = b_width * random(0.9, 1.1); // as in front width
        this.length = b_length * random(0.9, 1.1); // as in side length
        this.front_angle = front_angle// + random(-3, 5); // adjusted to be angle down from horizon line
        this.side_angle = 90-side_angle// + random(-2, 3); // adjusted to be angle down from horizon line

        switch(color_pick) {
            case 1:
                this.front_color = "#231D52"
                this.side_color = "#D65399"
                this.highlight_color = 543
                break;
            case 2:
                this.front_color = "#8E5B9E"//(142, 91, 158)//"#332D62"
                this.side_color = "#4049A2"//(64, 73, 162) //"#E663A9"
                break;
            case 3:
                this.front_color = "#322984"// 50 41 132
                this.side_color = "#6265CC"//"#79A5F0"// 121 165 240
                // 
                //this.front_color = "#2D155F"//(45, 21, 95)//"#433D72"
                //this.side_color = "#915D9B"//(145, 93, 155)//"#F673B9"
                break;
            case 4:
                this.front_color = "#F2777A"//(242, 119, 122)
                this.side_color = "#3B399E"//(59, 57, 158)
                break;
            default:
                this.side_color = building01_side_color;
                this.front_color = building01_front_color;
        }
    }

    draw() {
        console.log("draw building");
        // left (angled) side
        fill(this.side_color);
        beginShape();
        vertex(this.x_i, this.y_i);
        
        let y_1 = Math.abs(sin(this.front_angle) * this.length);
        let x_1 = Math.abs(cos(this.front_angle) * this.length);

        vertex(this.x_i - x_1, this.y_i + y_1);
        vertex(this.x_i - x_1, height);
        vertex(this.x_i, height);
        
        endShape(CLOSE);
        
        // right (flat) side
        fill(this.front_color);
        beginShape();
        vertex(this.x_i, this.y_i);
        
        let y_2 = Math.abs(sin(this.side_angle) * this.width);
        let x_2 = Math.abs(cos(this.side_angle) * this.width);

        vertex(this.x_i + x_2, this.y_i + y_2);
        vertex(this.x_i + x_2, height);
        vertex(this.x_i, height);

        endShape(CLOSE);
    }

    move(x) {
        let target = x + this.x_origin
        this.x_i += (target - this.x_i) * .02
    }
}
/// <reference path="typings/jquery.d.ts" />
/// <reference path="typings/imagecreator.d.ts" />



const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

let SHOW_ALL_LAYER_DEBUG = false;

enum StepEnum {
    Area,
    AreaAndInnerArea,
    OuterWallsOutline,
    OuterAndInnerWallsOutline,
    OuterAndInnerWalls,
    FinalWall,
    FinalWallWithTowers,
    BuildingArea,
    Building,
    WallDecoration,
    Entrances,
    CourtyardArea,
    CourtyardDistricts,
    CourtyardBuildingsAreas,
    CourtyardStructures,
    Done
}

enum EntranceTypeEnum {
    None = 0,
    Small = 1,
    Large = 2,
    MAX = 3
}

enum WindowTypeEnum {
    None = 0,
    Type1 = 1,
    Type2 = 2,
    Tiny = 3,
    LargeBarred = 4,
    MAX = 5
}

enum CrenelationPatternEnum {
    None = 0,
    Step = 1,
    ZigZag = 2,
    CurvedStep = 3,
    MAX = 4
}

enum BannerPatternEnum {
    None = 0,
    Red = 1,
    Blue = 2,
    Green = 3,
    Yellow = 4,
    MAX = 5
}

enum TowerTypeEnum {
    None = 0,
    RoundWithRoof = 1,
    RoundWithoutRoof = 2,
    MAX = 3
}

class Settings {
    symmetric: boolean = true;
    thickness: number = 3;
    wallHeight: number = 4;
    wallCrackPercentage: number = 0.1;
    innerWallPlankPercentage: number = 0.2;

    noCourtyardArea: boolean = false;
    courtyardSpacing: number = 35;
    courtyardBuildingSpacing: number = 2;
    courtyardLargeBuildingPercentage: number = 0.5;
    courtyardParkPercentage: number = 0.1;
    courtyardParkWellPercentage: number = 0.2;
    courtyardParkStoneBorderWidth: number = 3;
    courtyardParkRenderDecoration: boolean = true;

    wallTowerHeight: number = 8;
    wallTowerType: TowerTypeEnum = TowerTypeEnum.RoundWithoutRoof;
    moatSize: number = this.thickness + 2;
    crenelationPattern: number = CrenelationPatternEnum.ZigZag;

    innerBuildingHeight: number = this.wallHeight * 2;
    innerBuildingTowersEveryXStories: number = 2;
    innerTowerHeight: number = this.wallTowerHeight * 2;
    innerBuildingStories: number = 4;
    innerBuildingStorySpacing: number = 5;
    innerBuildingTowerType: TowerTypeEnum = TowerTypeEnum.RoundWithRoof;

    windowType: WindowTypeEnum = WindowTypeEnum.Type1;
    windowSpacing: number = 3;
    windowHeight: number = 1;

    entranceType: EntranceTypeEnum = EntranceTypeEnum.Large;
    innerBuildingEntranceType: EntranceTypeEnum = EntranceTypeEnum.Large;

    bannerType: BannerPatternEnum = BannerPatternEnum.Blue;
    bannerSpacing: number = 5;

    randomize(rnd: Sampling.Random, w: number, h: number) {

        this.symmetric = rnd.next() >= 0.2;

        this.noCourtyardArea = rnd.next() < 0.1;
        this.thickness = this.noCourtyardArea ? w : ~~rnd.nextBetween(1, w / 10);
        this.wallHeight = ~~rnd.nextBetween(4, 10);
        this.wallCrackPercentage = rnd.next();
        this.wallTowerType = ~~rnd.nextBetween(0, TowerTypeEnum.MAX);
        this.innerWallPlankPercentage = rnd.next();
        this.courtyardSpacing = ~~Math.max(20, rnd.nextBetween(w / 8, w / 4));

        this.courtyardParkPercentage = rnd.nextBetween(0.1, 0.5);
        this.courtyardParkWellPercentage = rnd.nextBetween(0, 0.2);
        this.courtyardParkStoneBorderWidth = ~~rnd.nextBetween(1, 5);

        this.wallTowerHeight = Math.max(this.wallHeight + 2, ~~rnd.nextBetween(this.wallHeight + 2, this.wallHeight * 2));
        this.moatSize = w / 20;
        this.crenelationPattern = ~~rnd.nextBetween(0, CrenelationPatternEnum.MAX);

        this.innerBuildingHeight = ~~(this.wallHeight * rnd.nextBetween(1, 2));
        this.innerTowerHeight = Math.max(this.innerBuildingHeight, this.wallTowerHeight * 2);
        this.innerBuildingStories = ~~rnd.nextBetween(0, 10);
        this.innerBuildingStorySpacing = ~~rnd.nextBetween(4, w / 10);
        this.innerBuildingTowerType = ~~rnd.nextBetween(0, TowerTypeEnum.MAX);

        this.windowType = ~~rnd.nextBetween(0, WindowTypeEnum.MAX);
        this.windowSpacing = ~~rnd.nextBetween(2, 10);
        this.windowHeight = ~~rnd.nextBetween(1, this.wallHeight - 3);
        this.innerBuildingEntranceType = ~~rnd.nextBetween(0, EntranceTypeEnum.MAX);

        this.bannerType = ~~rnd.nextBetween(0, BannerPatternEnum.MAX);
        this.bannerSpacing = ~~rnd.nextBetween(5, 20);
    }
}

class Main {

    private tileset: Tileset;
    private settings: Settings;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private renderer: Renderer;

    public constructor(settings: Settings, canvas: HTMLCanvasElement, private width: number, private height: number, private cx: number, private cy: number, public rnd: Sampling.Random) {
        this.settings = settings;
        this.canvas = canvas;
        this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
        this.tileset = new Tileset(canvas, this.ctx, cx, cy);

        this.renderer = new Renderer(this.tileset, canvas, this.ctx, cx, cy);
    }

    run(step: StepEnum) {
        this.clear();

        // generate initial area
        let moatArea = this.generateInitialArea(step);
        // remove any outshoots smaller than 10 tiles
        moatArea.cleanUp(10);
        let moatCells = moatArea.getDistanceCells();

        // leave space for the moat to determine the wall area
        let outerWallArea = this.getShrunkArea(moatArea, moatCells, this.settings.moatSize);
        // clean up any tiles smaller than the moatsize
        outerWallArea.cleanUp(this.settings.moatSize);

        // now shift the moat area a bit down so it looks the same size everywhere
        moatArea.shiftDown(this.settings.wallHeight);
        // recalculate the distance for each cell
        moatCells = moatArea.getDistanceCells();
        
        // draw the moat area
        this.drawOutside(moatArea, moatCells);

        // draw the draw bridge
        this.drawDrawbridge(step, outerWallArea);

        // generate wall data for the outer wall
        let outerWallData = this.generateWalls(step, outerWallArea, this.settings.thickness, this.settings.wallHeight, this.settings.wallTowerType, this.settings.crenelationPattern,
            WindowTypeEnum.None, 0, 0, this.settings.entranceType, this.settings.bannerType, this.settings.bannerSpacing,
            this.settings.wallCrackPercentage, this.settings.innerWallPlankPercentage, 0);

        // draw the courtyard floor
        this.drawCourtyardFloor(step, outerWallArea, outerWallData);

        // draw the complete outer wall
        this.drawOuterWall(step, outerWallArea, outerWallData)

        // generate the data for the inner building
        let innerBuildingData = this.generateInnerBuildingArea(step, outerWallArea, outerWallData, this.settings.courtyardSpacing, this.settings.innerBuildingHeight);

        // if there is a courtyard area 
        if (!this.settings.noCourtyardArea)
            this.drawCourtyardDecorations(step, outerWallArea, outerWallData, innerBuildingData);

        // draw the inner building
        this.drawInnerBuilding(step, outerWallArea, outerWallData, innerBuildingData);

        // finalize the rendering
        this.renderer.finalize();
    }

    /**
     * Generates the initial area by placing rectangles randomly
     * If it has to be symmetric copy the right side to the left size
     */
    private generateInitialArea(step: StepEnum): Area {
        let area = new Area(this.width, this.height);

        for (let i: number = 0; i < 8; i++) {
            let r = Rectangle.fromLTRB(
                this.width / 2 - this.rnd.nextBetween(1, this.width / 2 - 1),
                this.height / 2 - this.rnd.nextBetween(1, this.height / 2 - 1),
                this.width / 2 + this.rnd.nextBetween(1, this.width / 2 - 5),
                this.height / 2 + this.rnd.nextBetween(1, this.height / 2 - 5));
            area.addRectangle(r);
        }
        // copy right to left if symmetric
        if (this.settings.symmetric) {
            let middle = ~~(area.w / 2);
            for (let i: number = 1; i < middle; i++) {
                for (let j: number = 0; j < area.h; j++) {
                    area.setMask(i, j, area.getMask(area.w - i, j));
                }
            }
        }
        return area;
    }

    /**
     * Draws all the tiles that fall outside the castle, so grass & moat
     */
    private drawOutside(area: Area, cells: Cell[][]) {

        for (let x: number = 0; x < area.w; x++) {
            for (let y: number = 0; y < area.h; y++) {
                let c = cells[x][y];

                if (c.t >= 1 || c.b >= 1 || c.l >= 1 || c.r >= 1 ||
                    c.lt >= 1 || c.lb >= 1 || c.rt >= 1 || c.rb >= 1) {
                    this.renderer.drawTile(404, x, y, 0);
                }
                else
                    this.renderer.drawTile(472, x, y, 0);
            }
        }
    }
    
    /**
     * Draws the drawbridge. It scans the lower bottom bounds of the specified wall area,
     * the entrance will always be in the middle of the lowest wall
     * Once the center of that wall piece is found, draw the draw bridge around that center
     */
    private drawDrawbridge(step: StepEnum, outerWallArea: Area) {
        if (step < StepEnum.FinalWallWithTowers)
            return;
        let bounds = outerWallArea.getBounds();
        let b = bounds.y + bounds.height - 1;
        
        // determine left & right boundaries of the wall piece
        let l = Number.MAX_VALUE;
        let r = Number.MIN_VALUE
        for (let i: number = 0; i < this.width; i++) {
            if (outerWallArea.getMask(i, b)) {
                l = i;
                break;
            }
        }
        for (let i: number = this.width - 1; i >= 0; i--) {
            if (outerWallArea.getMask(i, b)) {
                r = i;
                break;
            }
        }
        // calculate the center
        let center = ~~(l + (r - l) / 2);

        let width = 6;
        // draw the draw bridge
        for (let j: number = b; j < b + this.settings.moatSize + 2 + this.settings.wallHeight; j++) {

            for (let i: number = center - width + 2; i < center + width; i++) {
                this.renderer.drawTile(186, i, j, 0);
            }
            // draw the side walls of the draw bridge, with slighty higher layer than 1 so it is drawn above the lowest wall tiles
            this.renderer.drawTile(378, center - width + 2, j, 1.5);
            this.renderer.drawTile(379, center + width - 1, j, 1.5);
        }
    }
    
    /**
     * Creates the wall data for the outer wall by
     *  - determining the inner area (outer area shrunk by thickness)
     *  - determining all the possible tower points and making sure that they are not too close
     *
     */
    private generateWalls(step: StepEnum, a: Area, thickness: number, wallHeight: number, towerType: TowerTypeEnum,
        crenelationPattern: number, windowType: WindowTypeEnum, windowSpacing: number, windowHeight: number,
        entranceType: EntranceTypeEnum, bannerType: BannerPatternEnum, bannerSpacing: number,
        wallCrackPercentage: number, innerWallPlankPercentage: number, baseHeight: number) {

        let cells = a.getDistanceCells();

        let innerArea: Area = this.getShrunkArea(a, cells, thickness);
        let innerCells = innerArea.getDistanceCells();
        
        // determine on which points we can place towers
        let towerPoints: Point[] = [];
        for (let y: number = 0; y < a.h; y++) {
            for (let x: number = 0; x < a.w; x++) {
                // if on the corners of the wall
                if ((cells[x][y].l == 1 && cells[x][y].t == 1) ||
                    (cells[x][y].l == 1 && cells[x][y].b == 1) ||
                    (cells[x][y].r == 1 && cells[x][y].t == 1) ||
                    (cells[x][y].r == 1 && cells[x][y].b == 1)) {

                    let pt = new Point(x, y);

                    // check the distance to all the points that were already valid
                    let tooClose = false;
                    for (let p of towerPoints) {
                        if (p.distanceTo(pt) < 5) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (!tooClose)
                        towerPoints.push(pt);
                }
            }
        }

        // accumulate all the data into a walldata object
        let wd = new WallData(a, cells, innerArea, innerCells, thickness, wallHeight, towerPoints, towerType,
            crenelationPattern, windowType, windowSpacing, windowHeight,
            entranceType, bannerType, bannerSpacing, wallCrackPercentage, innerWallPlankPercentage,
            baseHeight);
        return wd;
    }

    /**
       * Draws the courtyard floor on all tiles in inside the walls 
       * These tiles are on the lowest layer, anything drawn after this
       * on the same layer or on higher layers will overdraw these
       */
    private drawCourtyardFloor(step: StepEnum, wallArea: Area, wallData: WallData) {
        if (step == StepEnum.Done) {
            for (let x: number = 0; x < wallArea.w; x++) {
                for (let y: number = 0; y < wallArea.h; y++) {
                    let c = wallData.cells[x][y];
                    if (c.t > 1) {
                        if (c.t >= 1 || c.b >= 1 || c.l >= 1 || c.r >= 1 ||
                            c.lt >= 1 || c.lb >= 1 || c.rt >= 1 || c.rb >= 1) {
                            this.renderer.drawTile(403, x, y, 0);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draws the outer wall with all its towers
     *
     */
    private drawOuterWall(step: StepEnum, wallArea: Area, outerWallData: WallData) {
        // draw the towers at the back
        if (step >= StepEnum.FinalWallWithTowers && outerWallData.towerType != TowerTypeEnum.None)
            this.drawBackTowers(step, this.settings.wallTowerHeight, wallArea, outerWallData);
        // draw the actual wall
        this.drawWalls(step, wallArea, outerWallData);
        
        // draw the towers at the front
        if (step >= StepEnum.FinalWallWithTowers && outerWallData.towerType != TowerTypeEnum.None) {
            this.drawFrontTowers(step, this.settings.wallTowerHeight, wallArea, outerWallData);
        }
    }
    
    /**
     * Draws a wall (inner and outer and the filler in between) but without towers
     *
     */
    private drawWalls(step: StepEnum, wallArea: Area, wallData: WallData) {
        let cells = wallData.cells;
        let innerCells = wallData.innerCells;
        let wallBounds = wallArea.getBounds();

        // draw the outer area
        if (step >= StepEnum.Area && step != StepEnum.Done) {
            this.drawArea(wallData.outerArea, "red");
        }

        // draw the inner area green
        if (step >= StepEnum.AreaAndInnerArea && step != StepEnum.Done) {
            this.drawArea(wallData.innerArea, "green");
        }

        for (let x: number = 0; x < wallArea.w; x++) {
            for (let y: number = 0; y < wallArea.h; y++) {
                let outerCell = cells[x][y];

                // draw the filler between the outer and inner area of the wall
                if (step >= StepEnum.FinalWall) {
                    this.drawWallPlanks(outerCell, x, y, innerCells, wallData.thickness, wallData.wallHeight, wallData.baseHeight);
                }

                if (step >= StepEnum.OuterWallsOutline) {
                    // get the vertical cross section of a wall at the current tile
                    // if we only need to draw the outline, limit the drawing to the first element
                    let idxs = this.getWallTilesetIdx(step, outerCell, x, y, cells, wallData);
                    if (step <= StepEnum.OuterAndInnerWallsOutline)
                        idxs.splice(1);

                    // draw all the tiles with decreasing layer
                    for (let k: number = 0; k < idxs.length; k++)
                        this.renderer.drawTile(idxs[k], x, y + k, wallData.baseHeight + wallData.wallHeight + 2 - k);

                    // draw wall decorations such as windows or banners
                    if (step >= StepEnum.WallDecoration)
                        this.drawOuterWallDecorations(outerCell, x, y, wallData);

                    // draw wall entrance(s)
                    if (step >= StepEnum.Entrances)
                        this.drawWallEntrances(outerCell, x, y, wallData, wallBounds);
                }

                if (step >= StepEnum.OuterAndInnerWallsOutline) {
                    // now do the same but for the inner wall
                    let innerCell = innerCells[x][y];
                    let idxs = this.getWallTilesetIdx(step, innerCell, x, y, cells, wallData);

                    if (step <= StepEnum.OuterAndInnerWallsOutline)
                        idxs.splice(1);

                    for (let k: number = 0; k < idxs.length; k++)
                        this.renderer.drawTile(idxs[k], x, y + k, wallData.baseHeight + wallData.wallHeight + 2 - k);

                    // draw inner wall decorations like planks sticking out
                    if (step >= StepEnum.WallDecoration)
                        this.drawInnerWallDecorations(innerCell, x, y, wallData);
                }
            }
        }
    }

    /**
     * Returns the tile indices for a vertical slice of the wall
     *
     */
    getWallTilesetIdx(step: StepEnum, c: Cell, x: number, y: number, cells: Cell[][], wallData: WallData): number[] {
        let wallHeight = wallData.wallHeight;
        let crenelationPattern = wallData.crenelationPattern;

        let padding = 0;

        let arr: number[] = [];

        if (c.t == 1 && c.l == 1) { // top wall, left
            arr.push(0);
            this.addTimes(arr, 373, wallHeight);
            arr.push(32);
            return arr;
        }

        if (c.t == 1 && c.r == 1) { // top wall, right
            arr.push(2);
            this.addTimes(arr, 405, wallHeight);
            arr.push(34);
            return arr;
        }

        if (c.t == 1 && c.l > 1 && c.r > 1) { // top wall, top
            if (crenelationPattern == CrenelationPatternEnum.None)
                arr.push(1);
            else if (crenelationPattern == CrenelationPatternEnum.Step)
                if (c.l % 2 == 0) arr.push(5); else arr.push(6);
            else if (crenelationPattern == CrenelationPatternEnum.ZigZag)
                if (c.l % 3 == 0) arr.push(10); else if (c.l % 3 == 1) arr.push(97); else arr.push(11);
            else if (crenelationPattern == CrenelationPatternEnum.CurvedStep)
                if (c.l % 2 == 0) arr.push(37); else arr.push(38);

            // remainder of the wall
            for (let j: number = 0; j < wallHeight; j++) {
                if (this.rnd.next() < wallData.wallCrackPercentage) {
                    let crackedTiles = this.tileset.getCrackedTiles();
                    arr.push(crackedTiles[~~this.rnd.nextBetween(0, crackedTiles.length)]);
                }
                else
                    arr.push(129);
            }
            // base of the wall
            arr.push(33);
            return arr;
        }

        if (c.b == 1 && c.l == 1) { // bottom wall, top left
            // corner
            arr.push(96);

            // remainder of the wall
            for (let j: number = 0; j < wallHeight; j++) {
                if (this.rnd.next() < wallData.wallCrackPercentage) {
                    let crackedTiles = this.tileset.getCrackedTiles();
                    arr.push(crackedTiles[~~this.rnd.nextBetween(0, crackedTiles.length)]);
                }
                else
                    arr.push(129);
            }
            // base of the wall
            arr.push(160);
            return arr;
        }

        if (c.b == 1 && c.r == 1) {  // bottom wall, top right
            // corner
            arr.push(98);
            // remainder of the wall
            this.addTimes(arr, 130, wallHeight);
            // base of the wall
            arr.push(162);
            return arr;
        }


        if (c.b == 1 && c.l > 1 && c.r > 1) { // bottom wall, top
            // crenelations
            if (crenelationPattern == CrenelationPatternEnum.None)
                arr.push(97);
            else if (crenelationPattern == CrenelationPatternEnum.Step)
                if (c.l % 2 == 0) arr.push(5); else arr.push(6);
            else if (crenelationPattern == CrenelationPatternEnum.ZigZag)
                if (c.l % 3 == 0) arr.push(10); else if (c.l % 3 == 1) arr.push(97); else arr.push(11);
            else if (crenelationPattern == CrenelationPatternEnum.CurvedStep)
                if (c.l % 2 == 0) arr.push(37); else arr.push(38);

            // remainder of the wall
            for (let j: number = 0; j < wallHeight; j++) {
                if (this.rnd.next() < wallData.wallCrackPercentage) {
                    let crackedTiles = this.tileset.getCrackedTiles();
                    arr.push(crackedTiles[~~this.rnd.nextBetween(0, crackedTiles.length)]);
                }
                else
                    arr.push(129);
            }
            // base of the wall
            arr.push(161);
            return arr;
        }

        // right wall
        if (c.r == 1 && c.b > 1) {
            if (crenelationPattern == CrenelationPatternEnum.None)
                arr.push(66);
            else
                if (c.t % 2 == 0) arr.push(134); else arr.push(166);
            return arr;
        }
        // left wall
        if (c.l == 1 && c.b > 1) {
            if (crenelationPattern == CrenelationPatternEnum.None)
                arr.push(64);
            else
                if (c.t % 2 == 0) arr.push(133); else arr.push(165);
            return arr;
        }

        // (outer corner) left bottom top
        if (c.lb == 1 && c.b > 1 && c.l > 1) return [4];
        // (outer corner) right bottom top
        if (c.rb == 1 && c.b > 1 && c.r > 1) return [3];

        // (outer corner) right top
        if (c.rt == 1 && c.t > 1 && c.r > 1) {
            arr.push(35);
            this.addTimes(arr, 437, wallHeight);
            arr.push(67);
            return arr;
        }

        // (outer corner) left top top
        if (c.lt == 1 && c.t > 1 && c.l > 1) {
            arr.push(36);
            this.addTimes(arr, 469, wallHeight);
            arr.push(68);
            return arr;
        }
        return arr;
    }
    
    /**
     * Draws the filler between the outer and inner wall
     */
    private drawWallPlanks(c: Cell, x: number, y: number, innerCells: Cell[][], thickness: number, wallHeight: number, baseHeight: number) {
        if (this.between(c.t, 0, thickness + 1) ||
            this.between(c.b, 0, thickness) ||
            this.between(c.l, 0, thickness) ||
            this.between(c.r, 0, thickness) ||
            this.between(c.lt, 0, thickness + 1) ||
            this.between(c.lb, 0, thickness) ||
            this.between(c.rt, 0, thickness + 1) ||
            this.between(c.rb, 0, thickness)) {
            // sigh some have overlap on the wrong side for filling in
            // hard code some rules to make sure they don't render on those 
            // tiles, uncomment and you'll see what i mean
            // this is also the reason why some have thickness+1 in the betweens above
            
            // make sure the layer is slightly lower than the top wall height, so it's beneath the crenelations
            if (c.t > 1 && innerCells[x][y].r != 1 && innerCells[x][y].l != 1)
                this.renderer.drawTile(113, x, y, baseHeight + wallHeight + 2 - 0.5);
        }
    }

    /**
     * Draws the outer wall decorations like windows and banners
     */
    private drawOuterWallDecorations(c: Cell, x: number, y: number, wallData: WallData) {
        
        // if we're at the bottom of the wall, that means all tiles have already been processed
        // above, so we can draw the banners / windows over it
        if ((c.b == 1 && c.l > 1 && c.r > 1)) {

            let windowHeight = wallData.windowHeight;
            let bannerHeight = 1;
            let layerWindow = wallData.baseHeight + wallData.wallHeight + windowHeight + 0.5;
            let layerBanner = wallData.baseHeight + wallData.wallHeight + bannerHeight + 0.5;

            // draw windows
            if (wallData.windowType == WindowTypeEnum.Type1 && c.l % wallData.windowSpacing == 0)
                this.renderer.drawTiles(203, x, y + windowHeight, 1, 2, layerWindow, true);

            else if (wallData.windowType == WindowTypeEnum.Type2 && c.l % wallData.windowSpacing == 0)
                this.renderer.drawTiles(139, x, y + windowHeight, 1, 2, layerWindow, true);

            else if (wallData.windowType == WindowTypeEnum.Tiny && c.l % wallData.windowSpacing == 0)
                this.renderer.drawTile(107, x, y + windowHeight, layerWindow);
            else if (wallData.windowType == WindowTypeEnum.LargeBarred && c.l % wallData.windowSpacing == 0) {
                if (wallData.towerType == TowerTypeEnum.None || c.l > 0)
                    this.renderer.drawTiles(426, x - 1, y + windowHeight, 2, 2, layerBanner, true);
            }
            
            // draw banners if there are no windows already
            else if (wallData.bannerType == BannerPatternEnum.Red && c.l % wallData.bannerSpacing == 0) {
                this.renderer.drawTiles(87, x, y + bannerHeight, 1, 3, layerBanner, true);
            }
            else if (wallData.bannerType == BannerPatternEnum.Blue && c.l % wallData.bannerSpacing == 0) {
                this.renderer.drawTiles(88, x, y + bannerHeight, 1, 3, layerBanner, true);
            }
            else if (wallData.bannerType == BannerPatternEnum.Green && c.l % wallData.bannerSpacing == 0) {
                this.renderer.drawTiles(183, x, y + bannerHeight, 1, 3, layerBanner + 0.5, true);
            }
            else if (wallData.bannerType == BannerPatternEnum.Yellow && c.l % wallData.bannerSpacing == 0) {
                this.renderer.drawTiles(184, x, y + bannerHeight, 1, 3, layerBanner + 0.5, true);
            }
        }
    }

    /**
     * Draws a wall entrance in the middle of the lowest wall
     *
     */
    private drawWallEntrances(c: Cell, x: number, y: number, wallData: WallData, wallBounds: Rectangle) {
        if (y != wallBounds.y + wallBounds.height - 1) // only on lowest wall
            return;

        if (wallData.entranceType == EntranceTypeEnum.Large && (c.b == 1 && c.l > 1 && c.r > 1) && (c.l - 7 == c.r || (c.l - 6 == c.r))) {
            // x-6 because walls are being drawn too, the next tile would otherwise
            // overwrite the door tiles here
            if (c.l > 6 && c.r > 6)
                this.renderer.drawTiles(262, x - 6, y + wallData.wallHeight - 3, 6, 5, wallData.baseHeight + 5 + 0.5, true);
        }
        // fallback to smaller entrance in case there is not enough space and
        // there must be an entrance
        else if (wallData.entranceType != EntranceTypeEnum.None && (c.b == 1 && c.l > 1 && c.r > 1) && (c.l - 1 == c.r || (c.l - 2 == c.r))) {
            // x-2 because walls are being drawn too, the next tile would otherwise
            // overwrite the door tiles here
            this.renderer.drawTiles(421, x - 2, y + wallData.wallHeight - 1, 3, 3, wallData.baseHeight + 3 + 0.4, true);
        }
    }


    /**
     * Draw the inner wall decorations, such as planks sticking out
     *
     */
    private drawInnerWallDecorations(c: Cell, x: number, y: number, wallData: WallData) {
        // only at the top of the wall
        if ((c.t == 1 && c.l > 1 && c.r > 1)) {

            let relativeY = 1;
            let layer = wallData.baseHeight + wallData.wallHeight + relativeY + 0.5;
            if (this.rnd.next() < wallData.innerWallPlankPercentage) {
                let plankTiles = this.tileset.getPlankDecorationTiles();
                this.renderer.drawTile(plankTiles[~~this.rnd.nextBetween(0, plankTiles.length)], x, y + relativeY, layer);
            }
        }
    }

    /**
     * Draws the towers at the lower left/right bottom of the wall
     *
     */
    private drawFrontTowers(step: StepEnum, towerHeight: number, wallArea: Area, wallData: WallData) {
        let wallHeight = wallData.wallHeight;

        let baseOffset = 2;

        // iterate over all tower points
        for (let pt of wallData.towerPoints) {
            let xx = pt.x;
            let yy = pt.y;

            let c = wallData.cells[xx][yy];

            // tower offset so it's centered on the corner
            let towerOffsetX = 0;
            if (c.r == 1 && c.b == 1)
                towerOffsetX = -1;
            let towerOffsetY = 0;

            let x = xx + towerOffsetX;
            let y = yy + towerOffsetY;
            
            // for all tiles on the bottom corners
            if ((c.l == 1 && c.b == 1) || (c.r == 1 && c.b == 1)) {

                // base wall of tower
                for (let k: number = 0; k < wallHeight + baseOffset; k++)
                    this.renderer.drawTiles(236, x - 1, y + k, 4, 1, wallData.baseHeight + wallHeight + baseOffset - k + 2, false);

                // base bottom of tower
                this.renderer.drawTiles(268, x - 1, y + wallHeight + baseOffset, 4, 1, wallData.baseHeight + 2, false);
                this.renderer.drawTiles(300, x - 1, y + wallHeight + baseOffset + 1, 4, 1, wallData.baseHeight + 1, false);

                // remaining top
                let remaining = towerHeight - wallHeight - baseOffset - 1;
                for (let k: number = 0; k < remaining; k++)
                    this.renderer.drawTiles(236, x - 1, y - k, 4, 1, wallData.baseHeight + wallHeight + baseOffset + k + 2, false);

                if (wallData.towerType == TowerTypeEnum.RoundWithRoof) {
                    // base tower
                    this.renderer.drawTiles(204, x - 1, y - remaining, 4, 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining, false);
                    // roof base
                    this.renderer.drawTiles(417, x - 1, y - remaining - 2, 4, 3, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 2, true);
                    // tower roof
                    this.drawRoundTowerRoof(x, y, remaining, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 2);
                }
                else if (wallData.towerType == TowerTypeEnum.RoundWithoutRoof) {
                    this.renderer.drawTiles(12, x - 1, y - remaining - 2, 4, 1, wallData.baseHeight + wallHeight + 3 + baseOffset + remaining + 2, true);
                    this.renderer.drawTiles(44, x - 1, y - remaining - 1, 4, 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 1 + 0.5, true);
                    this.renderer.drawTiles(172, x - 1, y - remaining - 1, 4, 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 1 + 0.8, true);
                    this.renderer.drawTiles(204, x - 1, y - remaining, 4, 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 0.5, false);
                    this.renderer.drawTile(213, x + 1, y - remaining - 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 1 + 0.8, false);
                    this.renderer.drawTile(212, x, y - remaining - 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 1 + 0.8, false);
                }
            }
        }
    }

    /**
     * Draws the back towers at the top corners of the wall
     *
     */
    private drawBackTowers(step: StepEnum, towerHeight: number, a: Area, wallData: WallData) {
        let wallHeight = wallData.wallHeight;

        let baseOffset = 0;

        for (let pt of wallData.towerPoints) {
            let xx = pt.x;
            let yy = pt.y;
            let c = wallData.cells[xx][yy];

            let towerOffsetX = 0;
            if (c.r == 1 && c.t == 1)
                towerOffsetX = -1;
            let towerOffsetY = 0;

            let x = xx + towerOffsetX;
            let y = yy + towerOffsetY;

            // only on the top corners of the wall
            if ((c.l == 1 && c.t == 1) || (c.r == 1 && c.t == 1)) {
                let left: boolean = (c.r == 1 && c.t == 1);
                
                // base wall of tower
                for (let k: number = 0; k < wallHeight + baseOffset; k++)
                    this.renderer.drawTiles(236, x - 1, y + k, 4, 1, wallData.baseHeight + wallHeight + baseOffset - k + 2, false);

                // base bottom of tower
                this.renderer.drawTiles(268, x - 1, y + wallHeight + baseOffset, 4, 1, wallData.baseHeight + 2, false);
                this.renderer.drawTiles(300, x - 1, y + wallHeight + baseOffset + 1, 4, 1, wallData.baseHeight + 1, false);

                let remaining = towerHeight - wallHeight - baseOffset - 1;
                for (let k: number = 0; k < remaining; k++) {
                    this.renderer.drawTiles(236, x - 1, y - k, 4, 1, wallData.baseHeight + wallHeight + baseOffset + k + 2, false);
                    // ladder
                    this.renderer.drawTile(k == 0 ? 94 : 62, x + (left ? 0 : 1), y + 1 - k, wallData.baseHeight + wallHeight + baseOffset + k + 2);
                }

                // ladder base
                this.renderer.drawTiles(30, x + (left ? 0 : 1), y - remaining, 1, 2, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 0.5, true);

                if (wallData.towerType == TowerTypeEnum.RoundWithRoof) {
                    // base tower
                    this.renderer.drawTiles(204, x - 1, y - remaining, 4, 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining, false);
                    // roof base
                    this.renderer.drawTiles(417, x - 1, y - remaining - 2, 4, 3, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 2, true);
                    // roof
                    this.drawRoundTowerRoof(x, y, remaining, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 2);
                }
                else if (wallData.towerType == TowerTypeEnum.RoundWithoutRoof) {
                    this.renderer.drawTiles(12, x - 1, y - remaining - 2, 4, 1, wallData.baseHeight + wallHeight + 3 + baseOffset + remaining + 2, true);
                    this.renderer.drawTiles(44, x - 1, y - remaining - 1, 4, 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 1 + 0.5, true);
                    this.renderer.drawTiles(172, x - 1, y - remaining - 1, 4, 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 1 + 0.8, true);
                    this.renderer.drawTiles(204, x - 1, y - remaining, 4, 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 0.5, false);
                    this.renderer.drawTile(213, x + 1, y - remaining - 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 1 + 0.8, false);
                    this.renderer.drawTile(212, x, y - remaining - 1, wallData.baseHeight + wallHeight + 2 + baseOffset + remaining + 1 + 0.8, false);
                }
            }
        }
    }

    /**
     * Draws the round tower roof at given position
     *
     */
    private drawRoundTowerRoof(x: number, y: number, remaining: number, curHeight: number) {

        let baseRoof = 352;
        for (let i: number = 0; i < 6; i++) {
            for (let j: number = 0; j < 4; j++) {
                if (j == 0 || j == 3) {
                    if (i > 1 && i < 5)
                        this.renderer.drawTile(baseRoof + i - j * this.tileset.cols, x - 2 + i, y - remaining - 2 - j, curHeight + j);
                }
                else
                    this.renderer.drawTile(baseRoof + i - j * this.tileset.cols, x - 2 + i, y - remaining - 2 - j, curHeight + j);

            }
        }
    }
    
 
    /**
     * Accumulates all the data necessary to place down the inner building.
     * The actual area for the building is shrunk from the outer wall area
     * so it has the same shape as the outside wall
     */
    private generateInnerBuildingArea(step: StepEnum, wallArea: Area, outerWallData: WallData, spacing: number, innerBuildingHeight: number) {
        let aCells = wallArea.getDistanceCells();
        let buildingArea = this.getShrunkArea(wallArea, aCells, spacing);
        // clean up the area and shift it up so it never overlaps with
        // the bottom wall
        // this means the building is not actually centered in the castle
        // but it makes the courtyard larger on the bottom, where the 
        // decorations are actually seen
        buildingArea.cleanUp(10);
        buildingArea.shiftUp(innerBuildingHeight);
        let buildingCells = buildingArea.getDistanceCells();
        return new InnerBuildingData(buildingCells, buildingArea);
    }


    /**
     * Draws the inner building with given data
     *
     */
    private drawInnerBuilding(step: StepEnum, outerWallArea: Area, outerWallData: WallData, innerBuildingData: InnerBuildingData) {
        this.generateInnerBuilding(step, outerWallArea, outerWallData, innerBuildingData, this.settings.innerBuildingStorySpacing, this.settings.innerBuildingHeight, this.settings.crenelationPattern, this.settings.windowType, this.settings.windowSpacing, this.settings.windowHeight, this.settings.innerBuildingEntranceType, 0);
    }

    /**
     * Recursively draw a wall with no inner area, with each time a smaller version
     * on top of itself. This becomes the main inner building. This reuses the wall generation
     * and thus can have all the features walls have like towers, decorations etc
     */
    private generateInnerBuilding(step: StepEnum, outerWallArea: Area, outerWallData: WallData, innerBuildingData: InnerBuildingData, storySpacing: number, innerBuildingHeight: number, crenelationPattern: number, windowType: WindowTypeEnum, windowSpacing: number, windowHeight: number, entranceType: number, curStory: number) {

        if (step >= StepEnum.BuildingArea) {
            // draw the building area
            if (step != StepEnum.Done)
                this.drawArea(innerBuildingData.buildingArea, "blue");

            // determine which height we're on 
            let baseHeight = 0;
            
            // if the outer walls had no inner area (= no courtyard area) then the base height is already the wall height
            if (this.settings.noCourtyardArea)
                baseHeight += outerWallData.wallHeight + 1;
            // increase the height for each story of the building
            baseHeight += curStory * (innerBuildingHeight + 1);

            // generate the wall data for the building (without inner wall)
            let buildingWallData = this.generateWalls(step, innerBuildingData.buildingArea, Number.POSITIVE_INFINITY, innerBuildingHeight, this.settings.innerBuildingTowerType, crenelationPattern,
                this.settings.windowType, this.settings.windowSpacing, windowHeight, this.settings.innerBuildingEntranceType, this.settings.bannerType, this.settings.bannerSpacing,
                this.settings.wallCrackPercentage, 0, baseHeight);
                
            // draw the walls
            if (step >= StepEnum.Building) {
                this.drawWalls(step, innerBuildingData.buildingArea, buildingWallData);

                // draw the towers if there are towers on this story
                if (this.settings.innerBuildingTowerType != TowerTypeEnum.None && curStory % this.settings.innerBuildingTowersEveryXStories == 0) {
                    this.drawBackTowers(step, this.settings.innerTowerHeight, outerWallArea, buildingWallData);
                    this.drawFrontTowers(step, this.settings.innerTowerHeight, outerWallArea, buildingWallData);
                }
            }

            // recursively create the next story
            if (curStory < this.settings.innerBuildingStories - 1) {
                let storyBuildingData = this.generateInnerBuildingArea(step, innerBuildingData.buildingArea, outerWallData, storySpacing, innerBuildingHeight);
                this.generateInnerBuilding(step, innerBuildingData.buildingArea, outerWallData, storyBuildingData, storySpacing, innerBuildingHeight, crenelationPattern, windowType, windowSpacing, windowHeight, entranceType, curStory + 1);
            }
        }
    }

    /**
     * The courtyard is a bit more complex. It goes through the following steps:
     *   - Creates a courtyard area that matches the place where things should be put. 
     *     This is determined by taking the inner area from the outer wall and subtracting
     *     the area from the inner building, after shifting it by the wall height (so it's not
     *     including the inner wall from the top)
     *
     *   - Take a random point inside that area, but far enough from the wall (padding)
     *   
     *   - Use that as an initial sample for a poisson disc sampling, then fill the remaining
     *     area with samples with enough distance between them that there are only a few
     * 
     *   - Use those points to split up the area into districts using a Manhattan distance based 
     *     voronoi
     * 
     *   - These districts will fill the entire map, so invert the courtyard area
     *     and subtract it, this makes the districts constrained to the courtyard
     *  
     *   - Then based on the settings percentage draw a building district or a park district
     *
     */
    private drawCourtyardDecorations(step: StepEnum, outerWallArea: Area, outerWallData: WallData, innerBuildingData: InnerBuildingData) {

        // determine the inner building area to subtract, again shift it 
        // down with its wall height to prevent the wall being included 
        // in the courtyard area
        let innerBuildingArea = innerBuildingData.buildingArea.clone();
        innerBuildingArea.shiftDown(this.settings.innerBuildingHeight + 2);

        // determine the courtyard area, shift it down with the wall height
        // so the outerwall is not included, then subtract the inner building area from it
        let courtyardArea = outerWallData.innerArea.clone();
        let courtyardCells = courtyardArea.getDistanceCells();
        courtyardArea.shiftDown(this.settings.wallHeight + 2);
        courtyardArea.subtract(innerBuildingArea);
        courtyardArea = this.getShrunkArea(courtyardArea, courtyardCells, 2);

        // draw the courtyard area
        if (step >= StepEnum.CourtyardArea && step != StepEnum.Done)
            this.drawArea(courtyardArea, "yellow");


        let districtPointPadding = 5;
        let districtPadding = 2;

        // determine the bounds and take the distance between sampling
        // points about half the width, that means that there will only
        // be a few districts (either width or height doesn't really matter,
        // the area is mostly square anyway)
        let courtyardBounds = courtyardArea.getBounds();
        let districtsDistance = courtyardBounds.width / 2;

        // if there's no courtyard distance, bail out
        if (districtsDistance <= 0)
            return;

        // determine the initial point 
        let pt: Point = null;
        for (let i: number = 0; i < this.width && pt == null; i++) {
            for (let j: number = 0; j < this.height && pt == null; j++) {
                let c = courtyardCells[i][j];
                if (c.l > districtPointPadding && c.r > districtPointPadding && Math.abs(c.l - c.r) > 10)
                    pt = new Point(i, j);
            }
        }
        if (pt == null)
            return;

        // setup a poisson disc sampling inside the courtyard area
        let pd = new Sampling.PoissonDisc(this.width, this.height, districtsDistance, 200, this.rnd, (x, y) => {
            return courtyardArea.getMask(x, y);
        });
        // add the initial sample
        pd.addInitialSample(pt.x, pt.y);
        // run until it's done
        while (!pd.isDone) {
            pd.step();
        }

        // convert the samples to points
        let pts: Point[] = [];
        for (let s of pd.samples) {
            pts.push(new Point(s.x, s.y));
        }

        // determine the different areas with voronoi
        let areas = courtyardArea.splitUpWithVoronoi(pts);

        // determine the inverse of the courtyard area, this will 
        // need to be subtracted from each district area
        let courtyardInverse = courtyardArea.clone();
        courtyardInverse.invert();

        let districtColors = ["red", "green", "blue", "yellow", "cyan", "magenta", "purple", "gray", "orange", "brown"];

        for (let i: number = 0; i < areas.length; i++) {
            let ar = areas[i];
            // subtract the courtyard inverse
            ar.subtract(courtyardInverse);
            // and clean up any chunks < 10 tiles
            ar.cleanUp(10);
            
            // shrink the area a bit so there's some spacing 
            // between them
            let arCells = ar.getDistanceCells();
            areas[i] = this.getShrunkArea(ar, arCells, 2);

            // draw the district
            if (step >= StepEnum.CourtyardDistricts && step != StepEnum.Done)
                this.drawArea(ar, districtColors[i % districtColors.length]);
        }
        
        // draw the district points
        if (step >= StepEnum.CourtyardDistricts && step != StepEnum.Done) {
            this.ctx.fillStyle = "black";
            for (let pt of pts) {
                this.ctx.fillRect(pt.x * this.cx, pt.y * this.cy, this.cx, this.cy);
            }
        }

        for (let i: number = 0; i < areas.length; i++) {
            let districtArea = areas[i];
            // for each of the districts draw either a park or building
            if (this.rnd.next() < this.settings.courtyardParkPercentage)
                this.drawCourtyardPark(step, districtArea);
            else
                this.drawCourtyardBuildings(step, districtArea);
        }

    }

    /**
     * Draws the courtyard buildings by:
     *  - overlaying a grid of random cell size (between a min & max)
     *  - foreach of those cells determine the maximum rectangle possible
     *    inside that cell.
     *  - if that rectangle is large enough, see it as a rectangle to place
     *    down a building
     *  - if that rectangle isn't large enough, use it as scrap rectangle
     *    to fill in with decorations such as crates
     * 
     *  - for the building rectangles, use a random that fuses the rectangle
     *    next to it into 1 rectangle (for larger houses)
     */
    private drawCourtyardBuildings(step: StepEnum, districtArea: Area) {
        if (step < StepEnum.CourtyardBuildingsAreas)
            return;
        
        // use some spacing between the buildings
        let rectanglePadding = this.settings.courtyardBuildingSpacing;
        // constrain the min & max cell size to not have huge or tiny
        // rectangles
        let minCellWidth = 8 + rectanglePadding;
        let minCellHeight = 10;
        let maxCellWidth = 15 + rectanglePadding;
        let maxCellHeight = 10;

        // determine a random cell width & height
        let cellWidth = minCellWidth + Math.floor(this.rnd.next() * (maxCellWidth - minCellWidth));
        let cellHeight = minCellHeight + Math.floor(this.rnd.next() * (maxCellHeight - minCellHeight));

        // determine the largest rectangle possible in the area
        let innerBounds = districtArea.getLargestRectangle();
        let bounds = districtArea.getBounds();

        // determine the columns & rows of the overlaid grid
        let cols = Math.floor(bounds.width / cellWidth);
        let rows = Math.floor(bounds.height / cellHeight);

        // build an array of rectangles for each row and column
        let rectanglesOfColumns: Rectangle[][] = new Array(cols);
        let rectanglesOfRows: Rectangle[][] = new Array(rows);
        for (let i: number = 0; i < cols; i++)
            rectanglesOfColumns[i] = [];
        for (let i: number = 0; i < rows; i++)
            rectanglesOfRows[i] = [];

        // keep track of the smaller rectangles as well
        let smallerRectangles: Rectangle[] = [];

        for (let x: number = 0; x < cols; x++) {
            for (let y: number = 0; y < rows; y++) {
                // extract the area for the cell
                // the sub area is relative positioned, so it
                // will go from 0 to subArea.width & same for height
                let subArea = districtArea.getSubArea(new Rectangle(bounds.x + x * cellWidth, bounds.y + y * cellHeight, cellWidth, cellHeight));
                // determine its boundaries
                let subBounds = subArea.getBounds();

                if (subBounds.width > 0 && subBounds.height > 0) {
                    // get the larges possible rectangle for the cell
                    let innerSubbounds = subArea.getLargestRectangle();

                    // if it's large enough, push it in the row & column rectangle arrays
                    if (innerSubbounds.width >= minCellWidth && innerSubbounds.width <= maxCellWidth &&
                        innerSubbounds.height >= minCellHeight && innerSubbounds.height <= maxCellHeight) {
                        // contract with the required padding
                        innerSubbounds.expand(-rectanglePadding, -rectanglePadding, -rectanglePadding, -rectanglePadding);
                        // move the bounds to absolute positioning within the map
                        innerSubbounds.move(bounds.x + x * cellWidth, bounds.y + y * cellHeight);

                        rectanglesOfColumns[x].push(innerSubbounds);
                        rectanglesOfRows[y].push(innerSubbounds);
                    }
                    else {
                        // also contract with the required padding
                        innerSubbounds.expand(-rectanglePadding - 1, -rectanglePadding - 1, -rectanglePadding - 1, -rectanglePadding - 1);
                        // and move it
                        innerSubbounds.move(bounds.x + x * cellWidth, bounds.y + y * cellHeight);
                        // but add it to the smaller rectangles instead
                        smallerRectangles.push(innerSubbounds);
                    }
                }
            }
        }

        // now we have rectangles for each row and for each column
        // iterate over each row and merge some of those rectangles
        // within the row together
        let finalRectanglesForBuildings: Rectangle[] = [];

        for (let j: number = 0; j < rows; j++) {
            for (let i: number = 0; i < rectanglesOfRows[j].length; i++) {
                let r1 = rectanglesOfRows[j][i];
                
                // if the rectangle has to be merged with the one next to it (if there is still one)
                if (this.rnd.next() < this.settings.courtyardLargeBuildingPercentage && i + 1 < rectanglesOfRows[j].length) {
                    let r2 = rectanglesOfRows[j][i + 1];

                    // check if the rectangle is actually the same size and on the same top
                    // otherwise you'd get a bounds that's larger than both and can spill outside the area
                    // also make sure the rectangles are somewhat close by next to each other
                    if (r1.y == r2.y && r1.height == r2.height && Math.abs(r2.x - r1.x) < r1.x + r2.x) {
                        finalRectanglesForBuildings.push(Rectangle.fromLTRB(r1.x, r1.y, r2.x + r2.width - 1, r2.y + r2.height - 1));
                        i += 1;
                    } else
                        finalRectanglesForBuildings.push(r1);
                }
                else
                    finalRectanglesForBuildings.push(r1);
            }
        }

        let districtCells = districtArea.getDistanceCells();

        // draw the district base floor, don't  include any grass in the middle
        if (step >= StepEnum.CourtyardStructures)
            this.drawDistrictBaseFloor(districtArea, districtCells, Number.MAX_VALUE);


        // for all of the rectangles that are large enough for buildings
        for (let r of finalRectanglesForBuildings) {

            // draw the outline
            if (step >= StepEnum.CourtyardBuildingsAreas && step != StepEnum.Done)
                this.drawRectangle(r, "rgba(0,0,0,0.5)");

            // draw the actual building
            if (step >= StepEnum.CourtyardStructures) {
                this.drawCourtyardBuildingAt(r.x, r.y, r.width, r.height);
            }
        }

        // for all remaining smaller rectangles, draw decorations
        for (let r of smallerRectangles) {

            // draw the outline
            if (step >= StepEnum.CourtyardBuildingsAreas && step != StepEnum.Done)
                this.drawRectangle(r, "rgba(0,0,0,0.5)");

            if (step >= StepEnum.CourtyardStructures) {
                // draw crates
                this.renderer.drawTiles(923, this.rnd.nextBetween(r.x, r.x + r.width - 2), this.rnd.nextBetween(r.y, r.y + r.height - 2), 2, 2, 1, false);
            }
        }
    }

    /**
     * Draws the district floor by using the distance cells
     * Any border can be easily mapped onto the border stone tiles,
     * similar to how the walls are drawn
     */
    private drawDistrictBaseFloor(districtArea: Area, districtCells: Cell[][], stoneWidth: number) {
        for (let i: number = 0; i < districtArea.w; i++) {
            for (let j: number = 0; j < districtArea.h; j++) {

                if (districtArea.getMask(i, j)) {
                    let c = districtCells[i][j];
                    // left top
                    if (c.t == 1 && c.l == 1) this.renderer.drawTile(633, i, j, 0);
                    // right top
                    else if (c.t == 1 && c.r == 1) this.renderer.drawTile(635, i, j, 0);
                    // top
                    else if (c.t == 1) this.renderer.drawTile(634, i, j, 0);
                    // single tile on the right side, don't draw
                    else if (c.b == 1 && c.t == 1 && c.r == 1) { }
                    // single tile on the left side, don't draw
                    else if (c.b == 1 && c.l == 1 && c.r == 1) { }
                    // left bottom
                    else if (c.b == 1 && c.l == 1) this.renderer.drawTile(697, i, j, 0);
                    // right bottom
                    else if (c.b == 1 && c.r == 1) this.renderer.drawTile(699, i, j, 0);
                    // bottom
                    else if (c.b == 1) this.renderer.drawTile(698, i, j, 0);
                    // left 
                    else if (c.l == 1) this.renderer.drawTile(665, i, j, 0);
                    // right
                    else if (c.r == 1) this.renderer.drawTile(667, i, j, 0);
                    // border around the inner area
                    else if (c.l < stoneWidth || c.r < stoneWidth || c.t < stoneWidth || c.b < stoneWidth ||
                        c.lt < stoneWidth || c.rt < stoneWidth || c.lb < stoneWidth || c.rb < stoneWidth)
                        this.renderer.drawTile(666, i, j, 0);
                    // the inner area
                    else this.renderer.drawTile(603, i, j, 0);
                }
            }
        }
    }
    
    /**
     * Draws a courtyard building at the specified position within the length & depth given
     *
     */
    private drawCourtyardBuildingAt(x: number, y: number, lengthModifier: number, depthModifier: number) {
        let height = 6;
        let depth = depthModifier - 3; // minimum 3
        let length = lengthModifier; // minimum 7
        let rooftiles = [525, 526, 557, 558];

        // top left of roof
        this.renderer.drawTile(513, x + 1, y, height);
        this.renderer.drawTile(544, x, y + 1, height);
        this.renderer.drawTile(545, x + 1, y + 1, height);

        // top right of roof
        this.renderer.drawTile(522, x + length - 1, y, height);
        this.renderer.drawTile(554, x + length - 1, y + 1, height);
        this.renderer.drawTile(555, x + length, y + 1, height);

        // sides of roof
        for (let j: number = 2; j < depth - 1; j++) {
            this.renderer.drawTile(864 + (j % 2) * this.tileset.cols, x, y + j, height);
            this.renderer.drawTile(865 + (j % 2) * this.tileset.cols, x + 1, y + j, height);

            this.renderer.drawTile(869 + (j % 2) * this.tileset.cols, x + length, y + j, height);
            this.renderer.drawTile(868 + (j % 2) * this.tileset.cols, x + length - 1, y + j, height);
        }
        
        // roof itself
        for (let i: number = 0; i < length - 3; i++) {
            this.renderer.drawTile(514, x + i + 2, y, height);
            for (let j: number = 1; j < depth - 1; j++)
                this.renderer.drawTile(rooftiles[~~this.rnd.nextBetween(0, rooftiles.length)], x + i + 2, y + j, height);
        }
        
        // left of house
        this.renderer.drawTiles(608, x, y + depth - 1, 2, 3, height - 1, false);
        this.renderer.drawTiles(704, x, y + depth - 1 + 3, 2, 3, 3, true);
        
        // right of house
        this.renderer.drawTiles(618, x + length - 1, y + depth - 1, 2, 3, height - 1, false);
        this.renderer.drawTiles(714, x + length - 1, y + depth - 1 + 3, 2, 3, 3, true);

        // front wall
        for (let i: number = 0; i < length - 3; i += 2) {
            this.renderer.drawTiles(610, x + 2 + i, y + depth - 1, 1, 6, height, true);

            if (x + 2 + i + 1 < x + length - 1) {
                this.renderer.drawTiles(611, x + 2 + i + 1, y + depth - 1, 1, 6, height, true);
             
                // enough room for windows, draw large window
                this.renderer.drawTiles(686, x + 2 + i, y + depth + 2, 2, 2, 3 + 0.3, true);
            }
            else {
                // small window
                this.renderer.drawTiles(685, x + 2 + i, y + depth + 2, 1, 2, 3 + 0.3, true);
            }
        }
        // middle of house
        let range = x + length - 5 - (x + 2);
        let middle = (x + 2) + (~~(this.rnd.next() * (range / 2))) * 2;
        //let middle = ~~this.rnd.nextBetween(x + 2, x + length - 5);
        this.renderer.drawTiles(612, middle, y + depth - 1, 4, 6, height + 0.4, true);

        // sign
        let signPos = this.rnd.next() < 0.5 ? middle - 1 : middle + 4;

        let signTiles = this.tileset.getBuildingSignDecorationTiles();
        let signTile = signTiles[~~this.rnd.nextBetween(0, signTiles.length)];
        this.renderer.drawTile(signTile, signPos, y + depth + 2, 3 + 0.5);
        
        // lantern
        this.renderer.drawTiles(780, middle + (this.rnd.next() < 0.5 ? 0 : 2), y + depth + 3, 2, 1, 2 + 0.5);

        // add decorations on the left and right side
        this.drawCourtyardBuildingDecoration(x, y, depth, length, true);
        this.drawCourtyardBuildingDecoration(x, y, depth, length, false);
    }

    /**
     * Draw random building decorations on the side of the building
     *
     */
    private drawCourtyardBuildingDecoration(xx: number, y: number, depth: number, length: number, left: boolean) {

        let x = xx + (left ? 0 : length);
        // decoration of sides of house
        // little decoration
        if (this.rnd.next() < 0.5) {
            let tinyTiles = this.tileset.getBuildingSideTinyDecorationTiles()
            // there's room for 3 little decorations
            for (let j: number = ~~this.rnd.nextBetween(0, 2); j < 3; j++) {
                let rndTile = tinyTiles[~~this.rnd.nextBetween(0, tinyTiles.length)];
                this.renderer.drawTile(rndTile, x, y + depth + 2 + j, 1);
            }
        }
        // large decoration
        else if (this.rnd.next() < 0.5) {
            let largeTiles = this.tileset.getBuildingSideLargeDecorationTiles()
            let largeRndTile = largeTiles[~~this.rnd.nextBetween(0, largeTiles.length)];
            this.renderer.drawTiles(largeRndTile, x, y + depth + 2 + (this.rnd.next() < 0.5 ? 0 : 1), 1, 2, 2, true);
        }

    }
    
    /**
     * Draws the courtyard park in a district area
     * It does the same base floor drawing as with the buildings district
     * But it also adds 2 poisson disc sampling to draw tiny decorations 
     * and large ones (tree / well)
     *
     */
    private drawCourtyardPark(step: StepEnum, districtArea: Area) {
        if (step < StepEnum.CourtyardStructures)
            return;

        let cells = districtArea.getDistanceCells();
        let stoneWidth = this.settings.courtyardParkStoneBorderWidth;

        // draw the floor
        this.drawDistrictBaseFloor(districtArea, cells, stoneWidth);

        // determine the inner grass area
        let innerArea: Area = this.getShrunkArea(districtArea, cells, stoneWidth + 2);
        let innerBounds = innerArea.getBounds();

        if (this.settings.courtyardParkRenderDecoration) {
            // setup poisson disc sampling for tiny decorations
            let distance = 3;
            let pd = new Sampling.PoissonDisc(this.width, this.height, distance, 200, this.rnd, (x, y) => {
                return innerArea.getMask(x, y);
            });

            // use the middle of the area as initial sample
            pd.addInitialSample(innerBounds.x + ~~(innerBounds.width / 2), innerBounds.y + ~~(innerBounds.height / 2));
            // generate samples
            while (!pd.isDone) {
                pd.step();
            }
            
            // on each of the samples, draw a random park decoration
            let parkSmallTiles = this.tileset.getCourtyardParkDecorationTiles();
            for (let s of pd.samples)
                this.renderer.drawTile(parkSmallTiles[~~this.rnd.nextBetween(0, parkSmallTiles.length)], s.x, s.y, 1);
            
            // setup poisson disc sampling for large decorations
            distance = 4;
            pd = new Sampling.PoissonDisc(this.width, this.height, distance, 200, this.rnd, (x, y) => {
                return innerArea.getMask(x, y);
            });

            // again use the middle of the area as initial sample
            pd.addInitialSample(innerBounds.x + ~~(innerBounds.width / 2), innerBounds.y + ~~(innerBounds.height / 2));
            // generate samples
            while (!pd.isDone) {
                pd.step();
            }

            // draw large decorations on the sample points
            for (let s of pd.samples) {

                if (this.rnd.next() < this.settings.courtyardParkWellPercentage) {
                    this.renderer.drawTiles(827, s.x, s.y, 2, 2, 1, false);
                }
                else {
                    this.renderer.drawTiles(880, s.x, s.y - 5, 4, 3, 4, true);
                    this.renderer.drawTiles(977, s.x + 1, s.y - 5 + 3, 2, 2, 1, false);
                }
            }
        }
    }

    /**
     * Adds the given value n times to the array
     *
     */
    private addTimes<T>(arr: Array<T>, val: T, times: number) {
        for (let i: number = 0; i < times; i++)
            arr.push(val);
    }

    /**
     * Clears the canvas and renderer
     *
     */
    clear() {
        this.renderer.clear();
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }


    /**
     * Creates an area from a base area that's contracted with a given padding
     *
     */
    getShrunkArea(area: Area, cells: Cell[][], padding: number): Area {
        let innerArea: Area = area.clone();
        for (let x: number = 0; x < area.w; x++) {
            for (let y: number = 0; y < area.h; y++) {
                let c = cells[x][y];
                if (c.t <= padding || c.b <= padding || c.l <= padding || c.r <= padding ||
                    c.lt <= padding || c.lb <= padding || c.rt <= padding || c.rb <= padding)
                    innerArea.setMask(x, y, false);
            }
        }
        return innerArea;
    }

    /**
     * Draws a rectangle with given color
     *
     */
    drawRectangle(r: Rectangle, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(r.x * this.cx, r.y * this.cy, r.width * this.cx, r.height * this.cy);
    }

    /**
     * Draws an area with given color
     *
     */
    drawArea(a: Area, color: string) {
        this.ctx.fillStyle = color;
        for (let x: number = 0; x < a.w; x++) {
            for (let y: number = 0; y < a.h; y++) {
                if (a.getMask(x, y))
                    this.ctx.fillRect(x * this.cx, y * this.cy, this.cx, this.cy);
            }
        }
    }

    /**
     * Checks if a value is between the min and max
     *
     */
    private between(val: number, min: number, max: number): boolean {
        return val > min && val <= max;
    }

    /**
     * Draws a grid between tiles
     */
    drawGrid() {
        for (let j: number = 0; j < this.height; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j * this.cy);
            this.ctx.lineTo(this.width * this.cx, j * this.cy);
            this.ctx.stroke();
        }
        for (let i: number = 0; i < this.width; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cx, 0);
            this.ctx.lineTo(i * this.cx, this.height * this.cy);
            this.ctx.stroke();
        }
    }
}

class WallData {
    constructor(public outerArea: Area, public cells: Cell[][], public innerArea: Area, public innerCells: Cell[][], public thickness: number,
        public wallHeight: number, public towerPoints: Point[], public towerType: TowerTypeEnum, public crenelationPattern: number,
        public windowType: WindowTypeEnum, public windowSpacing: number, public windowHeight: number,
        public entranceType: EntranceTypeEnum,
        public bannerType: BannerPatternEnum, public bannerSpacing: number,
        public wallCrackPercentage: number, public innerWallPlankPercentage: number,
        public baseHeight: number) { }
}

class InnerBuildingData {
    constructor(public cells: Cell[][], public buildingArea: Area) { }
}

class Tile implements DataStructs.IHeapItem {
    constructor(public idx: number, public x: number, public y: number, public layer: number, public showLayerDebug: boolean = false) { }

    compareTo(other: DataStructs.IComparable): number {
        return this.layer - (<Tile>other).layer;
    }

    getKey(): string {
        return this.idx + "_" + this.x + "_" + this.y + "_" + this.layer;
    }
}

/**
 * The renderer keeps track of a "z-buffer" so the tiles are always rendered from
 * lower layer to upper layer, regardless of the order the drawTile was made
 * The only exception is layer 0, which is drawn immediately because it's the lowest layer
 * and for performance reason. Putting that many tiles in the priority queue is expensive
 *
 */
class Renderer {

    private renderQueue: DataStructs.PriorityQueue<Tile>;

    constructor(private tileset: Tileset, private c: HTMLCanvasElement, private ctx: CanvasRenderingContext2D, private cx: number, private cy: number) {
        this.renderQueue = new DataStructs.PriorityQueue<Tile>();
    }

    /**
     * Draws a tile with given index on the given position and on the given layer
     *
     */
    drawTile(tilesetIdx: number, x: number, y: number, layer: number = 0, showLayerDebug: boolean = false) {
        // if it's the base layer, then render it directly, it'll be most
        // of the tiles and it needs to be renderered first anyway, this
        // way the queue won't be huge with 0 layer tiles
        if (layer == 0)
            this.drawT(tilesetIdx, x, y)
        else {
            let t = new Tile(tilesetIdx, x, y, layer, showLayerDebug);
            if (!this.renderQueue.contains(t.getKey()))
                this.renderQueue.enqueue(t);
        }
    }

    private drawT(idx: number, x: number, y: number) {
        let srcX = idx % this.tileset.cols;
        let srcY = Math.floor(idx / this.tileset.cols);

        this.ctx.drawImage(this.tileset.tilesetImage, srcX * TILE_WIDTH, srcY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, x * this.cx, y * this.cy, this.cx, this.cy);
    }

    /**
     * Draws tiles that are next to each other in the tileset
     * If decreateLayerWithY it will decrease the layer for each tile vertically. This 
     * is handy for vertical structures like walls, banners, etc.
     *
     */
    drawTiles(tilesetIdx: number, x: number, y: number, srcWidth: number, srcHeight: number, layer: number = 0, decreaseLayerWithY: boolean = false, showLayerDebug: boolean = false) {
        let srcX = tilesetIdx % this.tileset.cols;
        let srcY = Math.floor(tilesetIdx / this.tileset.cols);

        let curLayer = layer;
        for (let i: number = 0; i < srcWidth; i++) {
            for (let j: number = 0; j < srcHeight; j++) {

                // determine current layer
                if (decreaseLayerWithY)
                    curLayer = layer - j;

                // determine the tileset index of the current tile
                let srcIdx = (srcY + j) * this.tileset.cols + (srcX + i);
                if (curLayer <= 0)
                    this.drawT(srcIdx, x + i, y + j)
                else {
                    let t = new Tile(srcIdx, x + i, y + j, curLayer, showLayerDebug);
                    if (!this.renderQueue.contains(t.getKey()))
                        this.renderQueue.enqueue(t);
                }
            }
        }
    }

    /**
     * Clears the rendering queue
     *
     */
    clear() {
        this.renderQueue = new DataStructs.PriorityQueue<Tile>();
    }


    /**
     * Processes the rendering queue, by drawing all the tiles
     * Iterating (which takes the heap & sorts it) is faster than dequeueing
     * Both are O(n log n) but sort is significantly more optimized 
     */
    finalize() {
        this.renderQueue.foreach(t => {
            this.drawT(t.idx, t.x, t.y);

            // draw the layer info if required
            if (SHOW_ALL_LAYER_DEBUG || t.showLayerDebug) {
                let val = Math.round(t.layer * 100) / 100;
                let metrics = this.ctx.measureText(val + "");
                this.ctx.fillStyle = "red";
                this.ctx.fillRect(t.x * this.cx + 5 - 2, t.y * this.cy + this.cy / 2 - 8, metrics.width + 4, 8);
                this.ctx.fillStyle = "black";
                this.ctx.fillText(val + "", t.x * this.cx + 5, t.y * this.cy + this.cy / 2);
            }
        });
    }
}

class Tileset {

    public tilesetImage = <HTMLImageElement>document.getElementById("tileset");

    public cols = 1024 / TILE_WIDTH;
    public rows = 1024 / TILE_HEIGHT;

    private overlay = <HTMLCanvasElement>document.getElementById("tilesetOverlay");
    private oCtx = <CanvasRenderingContext2D>this.overlay.getContext("2d");


    constructor(private c: HTMLCanvasElement, private ctx: CanvasRenderingContext2D, private cx: number, private cy: number) {
        this.overlay.width = this.tilesetImage.width;
        this.overlay.height = this.tilesetImage.height;
        this.drawTilesetOverlay();
    }

    private drawTilesetOverlay() {
        this.oCtx.font = "15px Tahoma"
        for (let j: number = 0; j < this.rows; j++) {
            for (let i: number = 0; i < this.cols; i++) {

                let idx = j * this.cols + i;
                this.oCtx.fillText(idx + "", (i + 0.1) * TILE_WIDTH, (j + 0.5) * TILE_HEIGHT);
            }
        }

        for (let j: number = 0; j < this.rows; j++) {
            this.oCtx.beginPath();
            this.oCtx.moveTo(0, j * TILE_HEIGHT);
            this.oCtx.lineTo(this.cols * TILE_WIDTH, j * TILE_HEIGHT);
            this.oCtx.stroke();
        }
        for (let i: number = 0; i < this.rows; i++) {
            this.oCtx.beginPath();
            this.oCtx.moveTo(i * TILE_WIDTH, 0);
            this.oCtx.lineTo(i * TILE_HEIGHT, this.rows * TILE_HEIGHT);
            this.oCtx.stroke();
        }
    }

    getCrackedTiles(): number[] {
        return [99, 100, 131, 132, 163, 164, 193, 225];
    }

    getPlankDecorationTiles(): number[] {
        return [226, 227, 228];
    }

    getBuildingSignDecorationTiles(): number[] {
        return [940, 941, 942, 943, 972, 973, 974, 975, 1004];
    }
    getBuildingSideTinyDecorationTiles(): number[] {
        return [922, 885, 890, 891, 892, 893, 894, 985, 1017]
    }

    getBuildingSideLargeDecorationTiles(): number[] {
        return [976, 986, 991, 927];
    }

    getCourtyardParkDecorationTiles(): number[] {
        return [629, 630, 884, 661, 662, 693, 694];
    }

}

class Point {
    public constructor(public x: number, public y: number) { }

    distanceTo(pt: Point): number {
        return Math.sqrt((pt.x - this.x) ** 2 + (pt.y - this.y) ** 2);
    }
}

class Area {

    private mask: boolean[][];

    constructor(public w: number, public h: number) {
        this.mask = new Array(w);
        for (let i: number = 0; i < w; i++) {
            this.mask[i] = new Array(h);
            for (let j: number = 0; j < h; j++) {
                //console.log(":" + i + "," + j)
                this.mask[i][j] = false;
            }
        }
    }

    clone(): Area {
        let a = new Area(this.w, this.h);
        for (let i: number = 0; i < this.w; i++) {
            a.mask[i] = new Array(this.h);
            for (let j: number = 0; j < this.h; j++) {
                a.mask[i][j] = this.mask[i][j];
            }
        }
        return a;
    }

    public addRectangle(r: Rectangle) {
        for (let i: number = 0; i < r.width; i++) {
            for (let j: number = 0; j < r.height; j++) {
                if (r.x + i >= 0 && r.x + i < this.w &&
                    r.y + j >= 0 && r.y + j < this.h) {
                    this.mask[r.x + i][r.y + j] = true;
                }
            }
        }
    }


    public clearRectangle(r: Rectangle) {
        for (let i: number = 0; i < r.width; i++) {
            for (let j: number = 0; j < r.height; j++) {
                if (r.x + i >= 0 && r.x + i < this.w &&
                    r.y + j >= 0 && r.y + j < this.h) {
                    this.mask[r.x + i][r.y + j] = false;
                }
            }
        }
    }

    public shiftUp(dy: number) {
        for (let i: number = 0; i < this.w; i++) {
            for (let j: number = 0; j < this.h; j++) {
                if (j + dy < this.h)
                    this.mask[i][j] = this.mask[i][j + dy];
                else
                    this.mask[i][j] = false;
            }
        }
    }

    public shiftDown(dy: number) {
        for (let i: number = 0; i < this.w; i++) {
            for (let j: number = this.h - 1; j >= 0; j--) {
                if (j - dy > 0)
                    this.mask[i][j] = this.mask[i][j - dy];
                else
                    this.mask[i][j] = false;
            }
        }
    }

    public cleanUp(minSize: number) {
        // vertical check
        for (let i: number = 0; i < this.w; i++) {
            let lastEmpty = 0;
            for (let j: number = 0; j < this.h; j++) {
                if (!this.mask[i][j]) {
                    let newEmpty = j;
                    if (newEmpty - lastEmpty < minSize) {
                        for (let k: number = 0; k <= newEmpty - lastEmpty; k++) {
                            this.mask[i][lastEmpty + k] = false;
                        }
                        lastEmpty = newEmpty;
                    }
                }

            }
        }
        // horizontal check
        for (let j: number = 0; j < this.h; j++) {
            let lastEmpty = 0;
            for (let i: number = 0; i < this.w; i++) {
                if (!this.mask[i][j]) {
                    let newEmpty = i;
                    if (newEmpty - lastEmpty < minSize) {
                        for (let k: number = 0; k <= newEmpty - lastEmpty; k++) {
                            this.mask[lastEmpty + k][j] = false;
                        }
                        lastEmpty = newEmpty;
                    }
                }

            }
        }
    }

    public invert() {
        for (let i: number = 0; i < this.w; i++) {
            for (let j: number = 0; j < this.h; j++)
                this.mask[i][j] = !this.mask[i][j];
        }
    }

    public subtract(a: Area) {
        for (let i: number = 0; i < this.w; i++) {
            for (let j: number = 0; j < this.h; j++) {
                if (a.getMask(i, j))
                    this.mask[i][j] = false;
            }
        }
    }

    public getSubArea(r: Rectangle): Area {
        let a: Area = new Area(r.width, r.height);
        for (let i: number = r.x; i < r.x + r.width; i++) {
            for (let j: number = r.y; j < r.y + r.height; j++) {
                if (this.mask[i][j])
                    a.setMask(i - r.x, j - r.y, true);
            }
        }
        return a;
    }

    public getBounds(): Rectangle {
        let l = Number.MAX_VALUE;
        let r = Number.MIN_VALUE;
        let t = Number.MAX_VALUE;
        let b = Number.MIN_VALUE;
        let allUnset: boolean = true;
        for (let i: number = 0; i < this.w && allUnset; i++) {
            for (let j: number = 0; j < this.h && allUnset; j++) {
                if (this.mask[i][j]) {
                    l = i;
                    allUnset = false;
                }
            }
        }
        allUnset = true;
        for (let i: number = this.w - 1; i >= 0 && allUnset; i--) {
            for (let j: number = 0; j < this.h && allUnset; j++) {
                if (this.mask[i][j]) {
                    r = i;
                    allUnset = false;
                }
            }
        }
        allUnset = true;
        for (let j: number = 0; j < this.h && allUnset; j++) {
            for (let i: number = 0; i < this.w && allUnset; i++) {
                if (this.mask[i][j]) {
                    t = j;
                    allUnset = false;
                }
            }
        }
        allUnset = true;
        for (let j: number = this.h - 1; j >= 0 && allUnset; j--) {
            for (let i: number = 0; i < this.w && allUnset; i++) {
                if (this.mask[i][j]) {
                    b = j;
                    allUnset = false;
                }
            }
        }
        // console.log(`${l},${t},${r},${b}`);

        return Rectangle.fromLTRB(l, t, r, b);
    }

    public getMask(x: number, y: number) {
        x = ~~x;
        y = ~~y;
        if (x >= 0 && x < this.w && y >= 0 && y < this.h)
            return this.mask[x][y];
        else
            return false;
    }
    public setMask(x: number, y: number, val: boolean) {
        this.mask[x][y] = val;
    }

    /**
     * Split the area into multiple areas with Manhattan distance voronoi
     *
     */
    public splitUpWithVoronoi(pts: Point[]): Area[] {
        let areas: Area[] = [];
        for (let i: number = 0; i < pts.length; i++)
            areas.push(new Area(this.w, this.h));


        for (let i: number = 0; i < this.w; i++) {
            for (let j: number = 0; j < this.h; j++) {

                // determine the closest point for this tile
                let minDist = Number.MAX_VALUE;
                let minPt = 0;
                for (let p: number = 0; p < pts.length; p++) {
                    let pt = pts[p];
                    let dist = Math.abs(pt.y - j) + Math.abs(pt.x - i);
                    if (dist < minDist) {
                        minDist = dist;
                        minPt = p;
                    }
                }
                
                // add the tile to the corresponding area
                areas[minPt].setMask(i, j, true);
            }
        }
        return areas;
    }

    /**
     * For each tile calculate the distance to an unset tile in 8 directions
     */
    public getDistanceCells(): Cell[][] {
        let cells = new Array(this.w);
        for (let i: number = 0; i < this.w; i++) {
            cells[i] = new Array(this.h);
            for (let j: number = 0; j < this.h; j++) {
                cells[i][j] = new Cell();
                cells[i][j].mask = this.mask[i][j];
            }

        }

        for (let i: number = 0; i < this.w; i++) {
            for (let j: number = 0; j < this.h; j++) {
                let c = cells[i][j];

                if (this.mask[i][j]) {
                    // left
                    if (i - 1 >= 0) {
                        if (cells[i - 1][j].l > 0) {
                            cells[i][j].l = cells[i - 1][j].l + 1;
                        } else {
                            for (let k: number = i - 1; k >= 0; k--) {
                                if (!this.mask[k][j]) {
                                    cells[i][j].l = i - k;
                                    break;
                                }
                            }
                        }
                    }
                    else
                        cells[i][j].l = 1;

                    // top
                    if (j - 1 >= 0) {
                        if (cells[i][j - 1].t > 0) {
                            cells[i][j].t = cells[i][j - 1].t + 1;
                        } else {
                            for (let k: number = j - 1; k >= 0; k--) {
                                if (!this.mask[i][k]) {
                                    cells[i][j].t = j - k;
                                    break;
                                }
                            }
                        }
                    }
                    else
                        cells[i][j].t = 1;

                    // right
                    if (i + 1 < this.w) {
                        if (cells[i + 1][j].r > 0) {
                            cells[i][j].r = cells[i + 1][j].r + 1;
                        } else {
                            for (let k: number = i; k < this.w; k++) {
                                if (!this.mask[k][j]) {
                                    cells[i][j].r = k - i;
                                    break;
                                }
                            }
                            if (cells[i][j].r == 0)
                                cells[i][j].r = this.w - i;
                        }
                    }
                    else
                        cells[i][j].r = 1;

                    // bottom
                    if (j + 1 < this.h) {
                        if (cells[i][j + 1].b > 0) {
                            cells[i][j].b = cells[i][j + 1].b + 1;
                        } else {
                            for (let k: number = j + 1; k < this.h; k++) {
                                if (!this.mask[i][k]) {
                                    cells[i][j].b = k - j;
                                    break;
                                }
                            }
                            if (cells[i][j].b == 0)
                                cells[i][j].b = this.h - j;
                        }
                    }
                    else
                        cells[i][j].b = 1;

                    // left top
                    if (i - 1 >= 0 && j - 1 >= 0) {
                        if (cells[i - 1][j - 1].lt > 0) {
                            cells[i][j].lt = cells[i - 1][j - 1].lt + 1;
                        } else {
                            if (i - 1 > j - 1) {
                                let c = 1;
                                for (let k: number = i - 1; k >= 0; k--) {
                                    if (!this.mask[i - c][j - c]) {
                                        cells[i][j].lt = i - k;
                                        break;
                                    }
                                    c++;
                                }
                            }
                            else {
                                let c = 1;
                                for (let k: number = j - 1; k >= 0; k--) {
                                    if (!this.mask[i - c][j - c]) {
                                        cells[i][j].lt = j - k;
                                        break;
                                    }
                                    c++;
                                }
                            }
                        }
                    }
                    else
                        cells[i][j].lt = 1;
                        
                        
                    // right top
                    if (i + 1 < this.w && j - 1 >= 0) {
                        if (cells[i + 1][j - 1].rt > 0) {
                            cells[i][j].lt = cells[i + 1][j - 1].rt + 1;
                        } else {
                            if (this.w - i + 1 > j - 1) {
                                let c = 1;
                                for (let k: number = i + 1; k < this.w; k++) {
                                    if (!this.mask[i + c][j - c]) {
                                        cells[i][j].rt = k - i;
                                        break;
                                    }
                                    c++;
                                }
                            }
                            else {
                                let c = 1;
                                for (let k: number = j - 1; k >= 0; k--) {
                                    if (!this.mask[i + c][j - c]) {
                                        cells[i][j].rt = j - k;
                                        break;
                                    }
                                    c++;
                                }
                            }
                        }
                    }
                    else
                        cells[i][j].lt = 1;
                        
                    // left bottom
                    if (i - 1 >= 0 && j + 1 < this.h) {
                        if (cells[i - 1][j + 1].lb > 0) {
                            cells[i][j].lb = cells[i - 1][j + 1].lb + 1;
                        } else {
                            if (i - 1 > this.h - j + 1) {
                                let c = 1;
                                for (let k: number = i - 1; k >= 0; k--) {
                                    if (!this.mask[i - c][j + c]) {
                                        cells[i][j].lb = i - k;
                                        break;
                                    }
                                    c++;
                                }
                            }
                            else {
                                let c = 1;
                                for (let k: number = j + 1; k < this.h; k++) {
                                    if (!this.mask[i - c][j + c]) {
                                        cells[i][j].lb = k - j;
                                        break;
                                    }
                                    c++;
                                }
                            }
                        }
                    }
                    else
                        cells[i][j].lb = 1;
                        
                    // right bottom
                    if (i + 1 < this.w && j + 1 < this.h) {
                        if (cells[i + 1][j + 1].rb > 0) {
                            cells[i][j].rb = cells[i + 1][j + 1].rb + 1;
                        } else {
                            if (this.w - i + 1 > this.h - j + 1) {
                                let c = 1;
                                for (let k: number = i + 1; k < this.w; k++) {
                                    if (!this.mask[i + c][j + c]) {
                                        cells[i][j].rb = k - i;
                                        break;
                                    }
                                    c++;
                                }
                            }
                            else {
                                let c = 1;
                                for (let k: number = j + 1; k < this.h; k++) {
                                    if (!this.mask[i + c][j + c]) {
                                        cells[i][j].rb = k - j;
                                        break;
                                    }
                                    c++;
                                }
                            }
                        }
                    }
                    else
                        cells[i][j].rb = 1;

                }
            }
        }
        return cells;
    }


    public getLargestRectangle(): Rectangle {
        return Algorithm.MaximumRectangle.MaximalRectangle.main(this.w, this.h, this.mask);
    }

}

class Cell {
    mask: boolean = false;
    l: number = 0;
    t: number = 0;
    r: number = 0;
    b: number = 0;

    lt: number = 0;
    rt: number = 0;
    lb: number = 0;
    rb: number = 0;
}


class Rectangle {
    constructor(public x: number, public y: number, public width: number, public height: number) {
        this.x = ~~x;
        this.y = ~~y;
        this.width = ~~this.width;
        this.height = ~~this.height;
    }

    move(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }

    expand(paddingLeft: number, paddingTop: number, paddingRight: number, paddingBottom: number) {
        this.x -= paddingLeft;
        this.y -= paddingTop;
        this.width += paddingLeft + paddingRight;
        this.height += paddingTop + paddingBottom;
    }

    static fromLTRB(l: number, t: number, r: number, b: number): Rectangle {
        let rect = new Rectangle(l, t, r - l + 1, b - t + 1);
        return rect;
    }
}

namespace Algorithm.MaximumRectangle {
    class Cell {
        constructor(public col: number, public row: number) {

        }
    }


    class Cache {

        private aggregateHeights: number[];

        constructor(size: number) {
            this.aggregateHeights = [];
            for (let i = 0; i <= size; i++) {
                this.aggregateHeights.push(0);
            }
        }

        public get(col: number): number {
            return this.aggregateHeights[col];
        }

        public aggregate(cells: boolean[][], nrColumns: number, row: number) {

            for (let col = 0; col < nrColumns; col++) {
                let element: boolean = cells[col][row];

                if (!element) {
                    this.aggregateHeights[col] = 0;
                } else {
                    this.aggregateHeights[col] = this.aggregateHeights[col] + 1;
                }
            }
        }
    }

    /**
     * @see http://stackoverflow.com/a/20039017/1028367
     * @see http://www.drdobbs.com/database/the-maximal-rectangle-problem/184410529
     */
    export class MaximalRectangle {

        public static main(numColumns: number, numRows: number, cells: boolean[][]) {
            let bestArea = 0;
            let bestLowerLeftCorner = new Cell(0, 0);
            let bestUpperRightCorner = new Cell(-1, -1);

            let stack = [];
            let rectangleHeightCache = new Cache(numColumns);

            for (let row = 0; row < numRows; row++) {
                rectangleHeightCache.aggregate(cells, numColumns, row);
                for (let col = 0, currentRectHeight = 0; col <= numColumns; col++) {
                    let aggregateRectHeight = rectangleHeightCache.get(col);

                    if (aggregateRectHeight > currentRectHeight) {
                        stack.push(new Cell(col, currentRectHeight));
                        currentRectHeight = aggregateRectHeight;
                    } else if (aggregateRectHeight < currentRectHeight) {

                        let rectStartCell: Cell;
                        do {
                            rectStartCell = stack.pop();
                            let rectWidth = col - rectStartCell.col;
                            let area = currentRectHeight * rectWidth;
                            if (area > bestArea) {
                                bestArea = area;
                                bestLowerLeftCorner = new Cell(rectStartCell.col, row);
                                bestUpperRightCorner = new Cell(col - 1, row - currentRectHeight + 1);
                            }
                            currentRectHeight = rectStartCell.row;
                        } while (aggregateRectHeight < currentRectHeight);

                        currentRectHeight = aggregateRectHeight;
                        if (currentRectHeight != 0) {
                            stack.push(rectStartCell);
                        }
                    }
                }
            }

            return Rectangle.fromLTRB(bestLowerLeftCorner.col, bestUpperRightCorner.row, bestUpperRightCorner.col, bestLowerLeftCorner.row);
        }
    }
}

namespace DataStructs {

    export interface IComparable {
        compareTo(other: IComparable): number;
    }
    export interface IHashable {
        getKey(): string;
    }

    export interface IHeapItem extends IComparable, IHashable {

    }

    export class Map<TValue> {
        private obj: any;

        constructor() {
            this.obj = {};
        }

        public containsKey(key: string): boolean {
            return this.obj.hasOwnProperty(key) && typeof this.obj[key] !== "undefined";
        }

        public getKeys(): string[] {
            let keys: string[] = [];
            for (let el in this.obj) {
                if (this.obj.hasOwnProperty(el))
                    keys.push(el);
            }
            return keys;
        }

        public get(key: string): TValue {
            let o = this.obj[key];
            if (typeof o === "undefined")
                return null;
            else
                return <TValue>o;
        }

        public put(key: string, value: TValue): void {
            this.obj[key] = value;
        }

        public remove(key: string) {
            delete this.obj[key];
        }

        clone(): Map<TValue> {
            let m = new Map<TValue>();
            m.obj = {};
            for (let p in this.obj) {
                m.obj[p] = this.obj[p];
            }
            return m;
        }
    }
    class Heap<T extends IHeapItem> {

        private array: T[];
        private keyMap: Map<number>;

        constructor() {
            this.array = [];
            this.keyMap = new Map<number>();
        }

        public add(obj: T): void {
            if (this.keyMap.containsKey(obj.getKey())) {
                throw new Error("Item with key " + obj.getKey() + " already exists in the heap");
            }

            this.array.push(obj);
            this.keyMap.put(obj.getKey(), this.array.length - 1);
            this.checkParentRequirement(this.array.length - 1);
        }

        public replaceAt(idx: number, newobj: T): void {
            this.array[idx] = newobj;
            this.keyMap.put(newobj.getKey(), idx);
            this.checkParentRequirement(idx);
            this.checkChildrenRequirement(idx);
        }

        public shift(): T {
            return this.removeAt(0);
        }

        public remove(obj: T): void {
            let idx: number = this.keyMap.get(obj.getKey());

            if (idx == -1)
                return;
            this.removeAt(idx);
        }

        public removeWhere(predicate: (el: T) => boolean) {
            let itemsToRemove: T[] = [];
            for (let i: number = this.array.length - 1; i >= 0; i--) {
                if (predicate(this.array[i])) {
                    itemsToRemove.push(this.array[i]);
                }
            }
            for (let el of itemsToRemove) {
                this.remove(el);
            }
            for (let el of this.array) {
                if (predicate(el)) {
                    console.log("Idx of element not removed: " + this.keyMap.get(el.getKey()));
                    throw new Error("element not removed: " + el.getKey());
                }
            }
        }

        private removeAt(idx: number): T {
            let obj: any = this.array[idx];
            this.keyMap.remove(obj.getKey());
            let isLastElement: boolean = idx == this.array.length - 1;
            if (this.array.length > 0) {
                let newobj: any = this.array.pop();
                if (!isLastElement && this.array.length > 0)
                    this.replaceAt(idx, newobj);
            }
            return obj;
        }

        public foreach(func: (el: T) => void) {
            let arr = this.array.sort((e, e2) => e.compareTo(e2));
            for (let el of arr) {
                func(el);
            }
        }


        public peek(): T {
            return this.array[0];
        }

        public contains(key: string) {
            return this.keyMap.containsKey(key);
        }

        public at(key: string): T {
            let obj = this.keyMap.get(key);
            if (typeof obj === "undefined")
                return null;
            else
                return this.array[<number>obj];
        }

        public size(): number {
            return this.array.length;
        }

        public checkHeapRequirement(item: T) {
            let idx = <number>this.keyMap.get(item.getKey());
            if (idx != null) {
                this.checkParentRequirement(idx);
                this.checkChildrenRequirement(idx);
            }
        }

        private checkChildrenRequirement(idx: number): void {
            let stop: boolean = false;
            while (!stop) {
                let left: number = this.getLeftChildIndex(idx);
                let right: number = left == -1 ? -1 : left + 1;

                if (left == -1)
                    return;
                if (right >= this.size())
                    right = -1;

                let minIdx: number;
                if (right == -1)
                    minIdx = left;
                else
                    minIdx = (this.array[left].compareTo(this.array[right]) < 0) ? left : right;

                if (this.array[idx].compareTo(this.array[minIdx]) > 0) {
                    this.swap(idx, minIdx);
                    idx = minIdx; // iteratively instead of recursion for this.checkChildrenRequirement(minIdx);
                }
                else
                    stop = true;
            }
        }

        private checkParentRequirement(idx: number): void {
            let curIdx: number = idx;
            let parentIdx: number = Heap.getParentIndex(curIdx);
            while (parentIdx >= 0 && this.array[parentIdx].compareTo(this.array[curIdx]) > 0) {
                this.swap(curIdx, parentIdx);

                curIdx = parentIdx;
                parentIdx = Heap.getParentIndex(curIdx);
            }
        }

        public dump(): void {
            if (this.size() == 0)
                return

            let idx = 0;
            let leftIdx = this.getLeftChildIndex(idx);
            let rightIdx = leftIdx + 1;

            console.log(this.array);
            console.log("--- keymap ---");
            console.log(this.keyMap);
        }

        private swap(i: number, j: number): void {
            this.keyMap.put(this.array[i].getKey(), j);
            this.keyMap.put(this.array[j].getKey(), i);

            let tmp: T = this.array[i];
            this.array[i] = this.array[j];
            this.array[j] = tmp;
        }


        private getLeftChildIndex(curIdx: number): number {
            let idx: number = ((curIdx + 1) * 2) - 1;
            if (idx >= this.array.length)
                return -1;
            else
                return idx;
        }

        private static getParentIndex(curIdx: number): number {
            if (curIdx == 0)
                return -1;

            return Math.floor((curIdx + 1) / 2) - 1;
        }

        clone(): Heap<T> {
            let h = new Heap<T>();
            h.array = this.array.slice(0);
            h.keyMap = this.keyMap.clone();
            return h;
        }
    }

    export class PriorityQueue<T extends IHeapItem> {

        private heap: Heap<T> = new Heap<T>();

        public enqueue(obj: T): void {
            this.heap.add(obj);
        }

        public peek(): T {
            return this.heap.peek();
        }

        public updatePriority(key: T) {
            this.heap.checkHeapRequirement(key);
        }

        get(key: string): T {
            return this.heap.at(key);
        }

        get size(): number {
            return this.heap.size();
        }

        public dequeue(): T {
            return this.heap.shift();
        }

        dump() {
            this.heap.dump();
        }

        public contains(key: string) {
            return this.heap.contains(key);
        }
        removeWhere(predicate: (el: T) => boolean) {
            this.heap.removeWhere(predicate);
        }

        public foreach(func: (el: T) => void) {
            this.heap.foreach(func);
        }


        clone(): PriorityQueue<T> {
            let p = new PriorityQueue<T>();
            p.heap = this.heap.clone();
            return p;
        }
    }
}

namespace Sampling {

    // the size in pixels of the radius of the sample
    const SAMPLE_CIRCLE_RADIUS: number = 3;
    // Implementation based on http://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
    export class PoissonDisc {

        samples: Sample[] = [];

        private _isDone: boolean;
        get isDone(): boolean { return this._isDone; }

        private width: number;
        private height: number;

        private minDistance: number;
        private nrSamplingAttempts: number;

        private backgroundGrid: Sample[][] = [];
        private nrCols: number;
        private nrRows: number;
        private cellSize: number;

        private activeList: Sample[] = [];

        private canAddSample: (x: number, y: number) => boolean;


        private deepestSample: Sample = null;


        public getDeepestSample(): Sample {
            return this.deepestSample;
        }

        public drawLinks: boolean = true;
        public drawLinkColor: string = "white";


        public constructor(width: number, height: number, minDistance: number, nrSamplingAttempts: number, private rnd: Sampling.Random, canAddSample: (x: number, y: number) => boolean) {
            this.width = width;
            this.height = height;
            this.minDistance = minDistance;
            this.nrSamplingAttempts = nrSamplingAttempts;
            this.canAddSample = canAddSample;
            
            // step 0: initialize a n-dimensional background grid
            this.initBackgroundGrid();
        }

        /**
         * Initializes the background grid and determines the cell size and how many rows & cols the grid has
         */
        private initBackgroundGrid() {
            // ensure that there will only be at most 1 sample per cell in the background grid
            this.cellSize = this.minDistance;// / Math.sqrt(2));

            // determine the nr of cols & rows in the background grid
            this.nrCols = Math.ceil(this.width / this.cellSize);
            this.nrRows = Math.ceil(this.height / this.cellSize);

            for (var i: number = 0; i < this.nrCols; i++) {
                this.backgroundGrid[i] = [];
                for (var j: number = 0; j < this.nrRows; j++) {
                    this.backgroundGrid[i][j] = null;
                }
            }
        }

        public addInitialSample(x: number, y: number) {
            var initSample: Sample = new Sample(x, y);
            this.addSample(initSample);

            this.deepestSample = initSample;
        }
        /**
         * Adds a valid sample to the various constructs of the algorithm
         */
        private addSample(s: Sample) {
            var xIdx = Math.floor(s.x / this.width * this.nrCols);
            var yIdx = Math.floor(s.y / this.height * this.nrRows);

            this.backgroundGrid[xIdx][yIdx] = s;
            this.activeList.push(s);
            this.samples.push(s);

            //s.drawTo(Main.Canvases.ctxOverlay, true);
        }

        /**
         * Chooses a sample from the active list and tries to find a random sample between its r and 2r radius
         * that is not too close to other samples, checked by looking nearby samples up in the background grid
         * If no sample could be determined within <nrSamples> then stop looking and return false. Also remove the
         * sample from the active list because it will never have any suitable samples to expand upon.
         * 
         * @returns true if a sample was able to be found, otherwise false
         */
        step(): boolean {
            if (this.activeList.length <= 0) {
                this._isDone = true;
                return true;
            }

            // choose a random index from it
            var idx: number = Math.floor(this.rnd.next() * this.activeList.length);
            var s: Sample = this.activeList[idx];
            
            // generate up to nrSamples points uniformly from the spherical annullus between radius r and 2r (MIN_DISTANCE and 2 * MIN_DISTANCE)
            // around the chosen sample x_i
            
            // choose a point by creating a vector to the inner boundary
            // and multiplying it by a random value between [1-2]
            var initvX: number = this.minDistance;
            var initvY: number = 0;

            var k: number = 0;
            var found: boolean = false;
            // try finding a sample between r and 2r from the sample s, up to nrSamplingAttempts times
            while (k < this.nrSamplingAttempts && !found) {

                // ( cos  sin )    x ( vX  ) = ( cos * vX + sin * vY )
                // ( -sin cos )      ( vY )    ( -sin * vX + cos * vY)
                var angle = this.rnd.next() * 2 * Math.PI;
                var vX = Math.cos(angle) * initvX + Math.sin(angle) * initvY;
                var vY = -Math.sin(angle) * initvX + Math.cos(angle) * initvY;

                // the length of the vector is already the min radius, so multiplying between 1 and 2
                // gives a sample in the r - 2r band around s.
                var length = 1 + this.rnd.next(); // between 1 and 2
                var x: number = s.x + length * vX;
                var y: number = s.y + length * vY;

                var xIdx = Math.floor(x / this.width * this.nrCols);
                var yIdx = Math.floor(y / this.height * this.nrRows);

                if (x >= 0 && y >= 0 && x < this.width && y < this.height
                    && this.backgroundGrid[xIdx][yIdx] == null
                    && !this.containsSampleInBackgroundGrid(x, y) && this.canAddSample(x, y)) {
                    // adequately far from existing samples
                
                    var newSample: Sample = new Sample(x, y);
                    newSample.previousSample = s;
                    newSample.depth = s.depth + 1;

                    if (this.deepestSample == null || newSample.depth > this.deepestSample.depth)
                        this.deepestSample = newSample;

                    this.addSample(newSample);

                    found = true;
                }
                k++;
            }
            if (!found) {
                // no suitable found, remove it from the active list
                this.activeList.splice(idx, 1);
                //  s.drawTo(Main.Canvases.ctxOverlay, false);
            }
            return found;
        }

        /**
         * Checks if there is a sample around the x,y sample that's closer than the minimum radius
         * using the background grid
         * 
         * @returns true if there is a sample within the minimum radius, otherwise false
         */
        containsSampleInBackgroundGrid(x: number, y: number): boolean {
            var xIdx = (x / this.width * this.nrCols);
            var yIdx = (y / this.height * this.nrRows);

            // determine the bounding box of the radius
            var lboundX = (x - this.minDistance) / this.width * this.nrCols;
            var lboundY = (y - this.minDistance) / this.height * this.nrRows;
            var uboundX = Math.ceil((x + this.minDistance) / this.width * this.nrCols);
            var uboundY = Math.ceil((y + this.minDistance) / this.height * this.nrRows);
            // make sure i,j falls within bounds
            if (lboundX < 0) lboundX = 0;
            if (lboundY < 0) lboundY = 0;
            if (uboundX >= this.nrCols) uboundX = this.nrCols - 1;
            if (uboundY >= this.nrRows) uboundY = this.nrRows - 1;

            for (var i: number = lboundX; i <= uboundX; i++) {
                for (var j: number = lboundY; j <= uboundY; j++) {
                    let sample = this.backgroundGrid[Math.floor(i)][Math.floor(j)];
                    // check if the cell contains a sample and if the distance is smaller than the minimum distance
                    if (sample != null &&
                        sample.distanceTo(x, y) < this.minDistance) {

                        return true; // short circuit if you don't need to draw the cells around the given x,y
                    }
                }
            }

            return false;
        }

    }

    export class Sample {
        x: number;
        y: number;

        previousSample: Sample = null;
        depth: number;

        public constructor(x: number, y: number) {
            this.x = Math.floor(x);
            this.y = Math.floor(y);
            this.depth = 0;
        }

        drawTo(ctx: CanvasRenderingContext2D, isActive: boolean) {
            ctx.beginPath();
            if (isActive)
                ctx.fillStyle = "#CCC";
            else
                ctx.fillStyle = "black";

            ctx.arc(this.x, this.y, SAMPLE_CIRCLE_RADIUS, 0, 2 * Math.PI, false);

            ctx.fill();
            ctx.stroke();
        }

        distanceTo(x: number, y: number): number {
            return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
        }
    }


    export class Random {
        seed: number;

        private val: number;
        constructor(seed?: number) {
            if (typeof seed === "undefined")
                seed = ~~(Math.random() * 10000000);

            this.seed = seed;
            this.val = seed;
        }

        next(): number {
            // this is in no way uniformly distributed, so it's really a bad rng, but it's fast enough
            // and random enough
            let x = Math.sin(this.val++) * 10000;
            return x - Math.floor(x);
        }

        nextBetween(min: number, max: number): number {
            return min + this.next() * (max - min);
        }
    }
}

// -----------------------------------------------------------
        
let zoom = 1 / 8;
let seed = 123456789;
let settings = new Settings();
let m: Main;

function initialize() {

    let c = <HTMLCanvasElement>document.getElementById("c1");
    let ctx = <CanvasRenderingContext2D>c.getContext("2d");

    let cx = ~~(TILE_WIDTH * zoom);
    let cy = ~~(TILE_HEIGHT * zoom);

    let w = ~~(c.width / cx);
    let h = ~~(c.height / cy);
    $(".layers").height(c.height);

    let rnd = new Sampling.Random(seed);
    $("#txtSeed").val(rnd.seed + "");
    settings.randomize(rnd, w, h);


    m = new Main(settings, c, w, h, cx, cy, rnd);
    m.run(StepEnum.Done);
}
$("#txtSeed").change(function() {
    seed = $(this).val();
    initialize();
});
$("#tileset").load(function() {
    initialize();
});

$("#txtZoom").change(function() {
    zoom = 1 / <number>$(this).val();
    initialize();
});


function showSteps() {
    let c = <HTMLCanvasElement>document.getElementById("c1");
    let ctx = <CanvasRenderingContext2D>c.getContext("2d");
    let rnd = new Sampling.Random(seed);
    let cx = ~~(TILE_WIDTH * zoom);
    let cy = ~~(TILE_HEIGHT * zoom);
    let w = ~~(c.width / cx);
    let h = ~~(c.height / cy);

    settings.randomize(rnd, w, h);

    m.rnd = rnd;
    let curStep = StepEnum.Area;
    let func = () => {
        if (!$("#chkSteps").prop("checked"))
            return;
        // reset the random
        m.rnd = rnd = new Sampling.Random(seed);
        settings.randomize(rnd, w, h);
        m.run(curStep);
        curStep = ++curStep % (StepEnum.Done + 1);
        if (curStep <= StepEnum.Done)
            window.setTimeout(func, curStep == StepEnum.Area ? 5000 : 1000);
    };
    func();
}
$("#chkSteps").change(function() {
    if ($(this).prop("checked")) {
        showSteps();
    }
    else {
        initialize();
    }
});

$("#chkToggleLayerDebug").change(function() {
    SHOW_ALL_LAYER_DEBUG = <boolean>$(this).prop("checked");
    initialize();
});

declare var exports;

$("#btnRandom").click(function() {
    seed = ~~(Math.random() * 1000000000);
    initialize();
});


function generateCanvas(): HTMLCanvasElement {
    let c = <HTMLCanvasElement>document.createElement("canvas");

    let previewC = <HTMLCanvasElement>document.getElementById("c1");
    c.width = previewC.width / zoom;
    c.height = previewC.height / zoom;

    let cx = ~~(TILE_WIDTH);
    let cy = ~~(TILE_HEIGHT);

    let w = ~~(c.width / cx);
    let h = ~~(c.height / cy);
    let rnd = new Sampling.Random(seed);
    let settings = new Settings();
    settings.randomize(rnd, w, h);
    let main = new Main(settings, c, w, h, cx, cy, rnd);
    main.run(StepEnum.Done);

    return c;
}

$("#btnLarge").click(function() {
    let c = generateCanvas();

    $(document.body).append(c);
    $(c).click(function() {
        $(c).detach();
    });
});


$("#btnUploadLargeToImgur").click(function() {
    $("#btnUploadLargeToImgur").prop("disabled", true);

    let c = generateCanvas();

    let png: ImageCreator.PngCreator = new exports.PngCreator();
    png.setImage(c);
    png.uploadToImgur("Procedural castle - seed " + seed, "", (success, id) => {
        if (success)
            window.open("http://www.imgur.com/" + id);
        else
            alert("Upload to imgur failed");

        $("#btnUploadLargeToImgur").prop("disabled", false);
    });
});

$("#btnCreateGif").click(function() {
    $("#btnCreateGif").prop("disabled", true);

    let c = <HTMLCanvasElement>document.createElement("canvas");
    let previewC = <HTMLCanvasElement>document.getElementById("c1");
    c.width = previewC.width;
    c.height = previewC.height;
    let ctx = <CanvasRenderingContext2D>c.getContext("2d");
    let rnd = new Sampling.Random(seed);
    let cx = ~~(TILE_WIDTH * zoom);
    let cy = ~~(TILE_HEIGHT * zoom);
    let w = ~~(c.width / cx);
    let h = ~~(c.height / cy);

    settings.randomize(rnd, w, h);

    let gif: ImageCreator.GIFCreator = new exports.GIFCreator();

    let main = new Main(settings, c, w, h, cx, cy, rnd);
    main.rnd = rnd;
    let curStep = StepEnum.Area;

    let onDone = () => {
        gif.render(() => {
            gif.uploadToImgur("Procedural castle - seed " + seed, "", (success, id) => {
                if (success)
                    window.open("http://www.imgur.com/" + id);
                else
                    alert("Upload to imgur failed");

                $("#btnCreateGif").prop("disabled", false);
            });
        });
    };
    let func = () => {
        // reset the random
        main.rnd = rnd = new Sampling.Random(seed);
        settings.randomize(rnd, w, h);
        main.run(curStep);

        gif.addFrame(c, 1000);

        curStep = ++curStep % (StepEnum.Done + 1);
        if (curStep < StepEnum.Done)
            window.setTimeout(func, 10);
        else
            onDone();
    };
    func();

});
       
     
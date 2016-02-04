/// <reference path="https://cdn.rawgit.com/borisyankov/DefinitelyTyped/master/jquery/jquery.d.ts" />
/// <reference path="https://cdn.rawgit.com/drake7707/distcollection/master/imagecreator.d.ts" />
var TILE_WIDTH = 32;
var TILE_HEIGHT = 32;
var SHOW_ALL_LAYER_DEBUG = false;
var StepEnum;
(function (StepEnum) {
    StepEnum[StepEnum["Area"] = 0] = "Area";
    StepEnum[StepEnum["AreaAndInnerArea"] = 1] = "AreaAndInnerArea";
    StepEnum[StepEnum["OuterWallsOutline"] = 2] = "OuterWallsOutline";
    StepEnum[StepEnum["OuterAndInnerWallsOutline"] = 3] = "OuterAndInnerWallsOutline";
    StepEnum[StepEnum["OuterAndInnerWalls"] = 4] = "OuterAndInnerWalls";
    StepEnum[StepEnum["FinalWall"] = 5] = "FinalWall";
    StepEnum[StepEnum["FinalWallWithTowers"] = 6] = "FinalWallWithTowers";
    StepEnum[StepEnum["BuildingArea"] = 7] = "BuildingArea";
    StepEnum[StepEnum["Building"] = 8] = "Building";
    StepEnum[StepEnum["WallDecoration"] = 9] = "WallDecoration";
    StepEnum[StepEnum["Entrances"] = 10] = "Entrances";
    StepEnum[StepEnum["CourtyardArea"] = 11] = "CourtyardArea";
    StepEnum[StepEnum["CourtyardDistricts"] = 12] = "CourtyardDistricts";
    StepEnum[StepEnum["CourtyardBuildingsAreas"] = 13] = "CourtyardBuildingsAreas";
    StepEnum[StepEnum["CourtyardStructures"] = 14] = "CourtyardStructures";
    StepEnum[StepEnum["Done"] = 15] = "Done";
})(StepEnum || (StepEnum = {}));
var EntranceTypeEnum;
(function (EntranceTypeEnum) {
    EntranceTypeEnum[EntranceTypeEnum["None"] = 0] = "None";
    EntranceTypeEnum[EntranceTypeEnum["Small"] = 1] = "Small";
    EntranceTypeEnum[EntranceTypeEnum["Large"] = 2] = "Large";
    EntranceTypeEnum[EntranceTypeEnum["MAX"] = 3] = "MAX";
})(EntranceTypeEnum || (EntranceTypeEnum = {}));
var WindowTypeEnum;
(function (WindowTypeEnum) {
    WindowTypeEnum[WindowTypeEnum["None"] = 0] = "None";
    WindowTypeEnum[WindowTypeEnum["Type1"] = 1] = "Type1";
    WindowTypeEnum[WindowTypeEnum["Type2"] = 2] = "Type2";
    WindowTypeEnum[WindowTypeEnum["Tiny"] = 3] = "Tiny";
    WindowTypeEnum[WindowTypeEnum["LargeBarred"] = 4] = "LargeBarred";
    WindowTypeEnum[WindowTypeEnum["MAX"] = 5] = "MAX";
})(WindowTypeEnum || (WindowTypeEnum = {}));
var CrenelationPatternEnum;
(function (CrenelationPatternEnum) {
    CrenelationPatternEnum[CrenelationPatternEnum["None"] = 0] = "None";
    CrenelationPatternEnum[CrenelationPatternEnum["Step"] = 1] = "Step";
    CrenelationPatternEnum[CrenelationPatternEnum["ZigZag"] = 2] = "ZigZag";
    CrenelationPatternEnum[CrenelationPatternEnum["CurvedStep"] = 3] = "CurvedStep";
    CrenelationPatternEnum[CrenelationPatternEnum["MAX"] = 4] = "MAX";
})(CrenelationPatternEnum || (CrenelationPatternEnum = {}));
var BannerPatternEnum;
(function (BannerPatternEnum) {
    BannerPatternEnum[BannerPatternEnum["None"] = 0] = "None";
    BannerPatternEnum[BannerPatternEnum["Red"] = 1] = "Red";
    BannerPatternEnum[BannerPatternEnum["Blue"] = 2] = "Blue";
    BannerPatternEnum[BannerPatternEnum["Green"] = 3] = "Green";
    BannerPatternEnum[BannerPatternEnum["Yellow"] = 4] = "Yellow";
    BannerPatternEnum[BannerPatternEnum["MAX"] = 5] = "MAX";
})(BannerPatternEnum || (BannerPatternEnum = {}));
var TowerTypeEnum;
(function (TowerTypeEnum) {
    TowerTypeEnum[TowerTypeEnum["None"] = 0] = "None";
    TowerTypeEnum[TowerTypeEnum["RoundWithRoof"] = 1] = "RoundWithRoof";
    TowerTypeEnum[TowerTypeEnum["RoundWithoutRoof"] = 2] = "RoundWithoutRoof";
    TowerTypeEnum[TowerTypeEnum["MAX"] = 3] = "MAX";
})(TowerTypeEnum || (TowerTypeEnum = {}));
var Settings = (function () {
    function Settings() {
        this.symmetric = true;
        this.thickness = 3;
        this.wallHeight = 4;
        this.wallCrackPercentage = 0.1;
        this.innerWallPlankPercentage = 0.2;
        this.noCourtyardArea = false;
        this.courtyardSpacing = 35;
        this.courtyardBuildingSpacing = 2;
        this.courtyardLargeBuildingPercentage = 0.5;
        this.courtyardParkPercentage = 0.1;
        this.courtyardParkWellPercentage = 0.2;
        this.courtyardParkStoneBorderWidth = 3;
        this.courtyardParkRenderDecoration = true;
        this.wallTowerHeight = 8;
        this.wallTowerType = TowerTypeEnum.RoundWithoutRoof;
        this.moatSize = this.thickness + 2;
        this.crenelationPattern = CrenelationPatternEnum.ZigZag;
        this.innerBuildingHeight = this.wallHeight * 2;
        this.innerBuildingTowersEveryXStories = 2;
        this.innerTowerHeight = this.wallTowerHeight * 2;
        this.innerBuildingStories = 4;
        this.innerBuildingStorySpacing = 5;
        this.innerBuildingTowerType = TowerTypeEnum.RoundWithRoof;
        this.windowType = WindowTypeEnum.Type1;
        this.windowSpacing = 3;
        this.windowHeight = 1;
        this.entranceType = EntranceTypeEnum.Large;
        this.innerBuildingEntranceType = EntranceTypeEnum.Large;
        this.bannerType = BannerPatternEnum.Blue;
        this.bannerSpacing = 5;
    }
    Settings.prototype.randomize = function (rnd, w, h) {
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
    };
    return Settings;
})();
var Main = (function () {
    function Main(settings, canvas, width, height, cx, cy, rnd) {
        this.width = width;
        this.height = height;
        this.cx = cx;
        this.cy = cy;
        this.rnd = rnd;
        this.settings = settings;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tileset = new Tileset(canvas, this.ctx, cx, cy);
        this.renderer = new Renderer(this.tileset, canvas, this.ctx, cx, cy);
    }
    Main.prototype.run = function (step) {
        this.clear();
        // generate initial area
        var moatArea = this.generateInitialArea(step);
        // remove any outshoots smaller than 10 tiles
        moatArea.cleanUp(10);
        var moatCells = moatArea.getDistanceCells();
        // leave space for the moat to determine the wall area
        var outerWallArea = this.getShrunkArea(moatArea, moatCells, this.settings.moatSize);
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
        var outerWallData = this.generateWalls(step, outerWallArea, this.settings.thickness, this.settings.wallHeight, this.settings.wallTowerType, this.settings.crenelationPattern, WindowTypeEnum.None, 0, 0, this.settings.entranceType, this.settings.bannerType, this.settings.bannerSpacing, this.settings.wallCrackPercentage, this.settings.innerWallPlankPercentage, 0);
        // draw the courtyard floor
        this.drawCourtyardFloor(step, outerWallArea, outerWallData);
        // draw the complete outer wall
        this.drawOuterWall(step, outerWallArea, outerWallData);
        // generate the data for the inner building
        var innerBuildingData = this.generateInnerBuildingArea(step, outerWallArea, outerWallData, this.settings.courtyardSpacing, this.settings.innerBuildingHeight);
        // if there is a courtyard area 
        if (!this.settings.noCourtyardArea)
            this.drawCourtyardDecorations(step, outerWallArea, outerWallData, innerBuildingData);
        // draw the inner building
        this.drawInnerBuilding(step, outerWallArea, outerWallData, innerBuildingData);
        // finalize the rendering
        this.renderer.finalize();
    };
    /**
     * Generates the initial area by placing rectangles randomly
     * If it has to be symmetric copy the right side to the left size
     */
    Main.prototype.generateInitialArea = function (step) {
        var area = new Area(this.width, this.height);
        for (var i = 0; i < 8; i++) {
            var r = Rectangle.fromLTRB(this.width / 2 - this.rnd.nextBetween(1, this.width / 2 - 1), this.height / 2 - this.rnd.nextBetween(1, this.height / 2 - 1), this.width / 2 + this.rnd.nextBetween(1, this.width / 2 - 5), this.height / 2 + this.rnd.nextBetween(1, this.height / 2 - 5));
            area.addRectangle(r);
        }
        // copy right to left if symmetric
        if (this.settings.symmetric) {
            var middle = ~~(area.w / 2);
            for (var i = 1; i < middle; i++) {
                for (var j = 0; j < area.h; j++) {
                    area.setMask(i, j, area.getMask(area.w - i, j));
                }
            }
        }
        return area;
    };
    /**
     * Draws all the tiles that fall outside the castle, so grass & moat
     */
    Main.prototype.drawOutside = function (area, cells) {
        for (var x = 0; x < area.w; x++) {
            for (var y = 0; y < area.h; y++) {
                var c = cells[x][y];
                if (c.t >= 1 || c.b >= 1 || c.l >= 1 || c.r >= 1 ||
                    c.lt >= 1 || c.lb >= 1 || c.rt >= 1 || c.rb >= 1) {
                    this.renderer.drawTile(404, x, y, 0);
                }
                else
                    this.renderer.drawTile(472, x, y, 0);
            }
        }
    };
    /**
     * Draws the drawbridge. It scans the lower bottom bounds of the specified wall area,
     * the entrance will always be in the middle of the lowest wall
     * Once the center of that wall piece is found, draw the draw bridge around that center
     */
    Main.prototype.drawDrawbridge = function (step, outerWallArea) {
        if (step < StepEnum.FinalWallWithTowers)
            return;
        var bounds = outerWallArea.getBounds();
        var b = bounds.y + bounds.height - 1;
        // determine left & right boundaries of the wall piece
        var l = Number.MAX_VALUE;
        var r = Number.MIN_VALUE;
        for (var i = 0; i < this.width; i++) {
            if (outerWallArea.getMask(i, b)) {
                l = i;
                break;
            }
        }
        for (var i = this.width - 1; i >= 0; i--) {
            if (outerWallArea.getMask(i, b)) {
                r = i;
                break;
            }
        }
        // calculate the center
        var center = ~~(l + (r - l) / 2);
        var width = 6;
        // draw the draw bridge
        for (var j = b; j < b + this.settings.moatSize + 2 + this.settings.wallHeight; j++) {
            for (var i = center - width + 2; i < center + width; i++) {
                this.renderer.drawTile(186, i, j, 0);
            }
            // draw the side walls of the draw bridge, with slighty higher layer than 1 so it is drawn above the lowest wall tiles
            this.renderer.drawTile(378, center - width + 2, j, 1.5);
            this.renderer.drawTile(379, center + width - 1, j, 1.5);
        }
    };
    /**
     * Creates the wall data for the outer wall by
     *  - determining the inner area (outer area shrunk by thickness)
     *  - determining all the possible tower points and making sure that they are not too close
     *
     */
    Main.prototype.generateWalls = function (step, a, thickness, wallHeight, towerType, crenelationPattern, windowType, windowSpacing, windowHeight, entranceType, bannerType, bannerSpacing, wallCrackPercentage, innerWallPlankPercentage, baseHeight) {
        var cells = a.getDistanceCells();
        var innerArea = this.getShrunkArea(a, cells, thickness);
        var innerCells = innerArea.getDistanceCells();
        // determine on which points we can place towers
        var towerPoints = [];
        for (var y = 0; y < a.h; y++) {
            for (var x = 0; x < a.w; x++) {
                // if on the corners of the wall
                if ((cells[x][y].l == 1 && cells[x][y].t == 1) ||
                    (cells[x][y].l == 1 && cells[x][y].b == 1) ||
                    (cells[x][y].r == 1 && cells[x][y].t == 1) ||
                    (cells[x][y].r == 1 && cells[x][y].b == 1)) {
                    var pt = new Point(x, y);
                    // check the distance to all the points that were already valid
                    var tooClose = false;
                    for (var _i = 0; _i < towerPoints.length; _i++) {
                        var p = towerPoints[_i];
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
        var wd = new WallData(a, cells, innerArea, innerCells, thickness, wallHeight, towerPoints, towerType, crenelationPattern, windowType, windowSpacing, windowHeight, entranceType, bannerType, bannerSpacing, wallCrackPercentage, innerWallPlankPercentage, baseHeight);
        return wd;
    };
    /**
       * Draws the courtyard floor on all tiles in inside the walls
       * These tiles are on the lowest layer, anything drawn after this
       * on the same layer or on higher layers will overdraw these
       */
    Main.prototype.drawCourtyardFloor = function (step, wallArea, wallData) {
        if (step == StepEnum.Done) {
            for (var x = 0; x < wallArea.w; x++) {
                for (var y = 0; y < wallArea.h; y++) {
                    var c = wallData.cells[x][y];
                    if (c.t > 1) {
                        if (c.t >= 1 || c.b >= 1 || c.l >= 1 || c.r >= 1 ||
                            c.lt >= 1 || c.lb >= 1 || c.rt >= 1 || c.rb >= 1) {
                            this.renderer.drawTile(403, x, y, 0);
                        }
                    }
                }
            }
        }
    };
    /**
     * Draws the outer wall with all its towers
     *
     */
    Main.prototype.drawOuterWall = function (step, wallArea, outerWallData) {
        // draw the towers at the back
        if (step >= StepEnum.FinalWallWithTowers && outerWallData.towerType != TowerTypeEnum.None)
            this.drawBackTowers(step, this.settings.wallTowerHeight, wallArea, outerWallData);
        // draw the actual wall
        this.drawWalls(step, wallArea, outerWallData);
        // draw the towers at the front
        if (step >= StepEnum.FinalWallWithTowers && outerWallData.towerType != TowerTypeEnum.None) {
            this.drawFrontTowers(step, this.settings.wallTowerHeight, wallArea, outerWallData);
        }
    };
    /**
     * Draws a wall (inner and outer and the filler in between) but without towers
     *
     */
    Main.prototype.drawWalls = function (step, wallArea, wallData) {
        var cells = wallData.cells;
        var innerCells = wallData.innerCells;
        var wallBounds = wallArea.getBounds();
        // draw the outer area
        if (step >= StepEnum.Area && step != StepEnum.Done) {
            this.drawArea(wallData.outerArea, "red");
        }
        // draw the inner area green
        if (step >= StepEnum.AreaAndInnerArea && step != StepEnum.Done) {
            this.drawArea(wallData.innerArea, "green");
        }
        for (var x = 0; x < wallArea.w; x++) {
            for (var y = 0; y < wallArea.h; y++) {
                var outerCell = cells[x][y];
                // draw the filler between the outer and inner area of the wall
                if (step >= StepEnum.FinalWall) {
                    this.drawWallPlanks(outerCell, x, y, innerCells, wallData.thickness, wallData.wallHeight, wallData.baseHeight);
                }
                if (step >= StepEnum.OuterWallsOutline) {
                    // get the vertical cross section of a wall at the current tile
                    // if we only need to draw the outline, limit the drawing to the first element
                    var idxs = this.getWallTilesetIdx(step, outerCell, x, y, cells, wallData);
                    if (step <= StepEnum.OuterAndInnerWallsOutline)
                        idxs.splice(1);
                    // draw all the tiles with decreasing layer
                    for (var k = 0; k < idxs.length; k++)
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
                    var innerCell = innerCells[x][y];
                    var idxs = this.getWallTilesetIdx(step, innerCell, x, y, cells, wallData);
                    if (step <= StepEnum.OuterAndInnerWallsOutline)
                        idxs.splice(1);
                    for (var k = 0; k < idxs.length; k++)
                        this.renderer.drawTile(idxs[k], x, y + k, wallData.baseHeight + wallData.wallHeight + 2 - k);
                    // draw inner wall decorations like planks sticking out
                    if (step >= StepEnum.WallDecoration)
                        this.drawInnerWallDecorations(innerCell, x, y, wallData);
                }
            }
        }
    };
    /**
     * Returns the tile indices for a vertical slice of the wall
     *
     */
    Main.prototype.getWallTilesetIdx = function (step, c, x, y, cells, wallData) {
        var wallHeight = wallData.wallHeight;
        var crenelationPattern = wallData.crenelationPattern;
        var padding = 0;
        var arr = [];
        if (c.t == 1 && c.l == 1) {
            arr.push(0);
            this.addTimes(arr, 373, wallHeight);
            arr.push(32);
            return arr;
        }
        if (c.t == 1 && c.r == 1) {
            arr.push(2);
            this.addTimes(arr, 405, wallHeight);
            arr.push(34);
            return arr;
        }
        if (c.t == 1 && c.l > 1 && c.r > 1) {
            if (crenelationPattern == CrenelationPatternEnum.None)
                arr.push(1);
            else if (crenelationPattern == CrenelationPatternEnum.Step)
                if (c.l % 2 == 0)
                    arr.push(5);
                else
                    arr.push(6);
            else if (crenelationPattern == CrenelationPatternEnum.ZigZag)
                if (c.l % 3 == 0)
                    arr.push(10);
                else if (c.l % 3 == 1)
                    arr.push(97);
                else
                    arr.push(11);
            else if (crenelationPattern == CrenelationPatternEnum.CurvedStep)
                if (c.l % 2 == 0)
                    arr.push(37);
                else
                    arr.push(38);
            // remainder of the wall
            for (var j = 0; j < wallHeight; j++) {
                if (this.rnd.next() < wallData.wallCrackPercentage) {
                    var crackedTiles = this.tileset.getCrackedTiles();
                    arr.push(crackedTiles[~~this.rnd.nextBetween(0, crackedTiles.length)]);
                }
                else
                    arr.push(129);
            }
            // base of the wall
            arr.push(33);
            return arr;
        }
        if (c.b == 1 && c.l == 1) {
            // corner
            arr.push(96);
            // remainder of the wall
            for (var j = 0; j < wallHeight; j++) {
                if (this.rnd.next() < wallData.wallCrackPercentage) {
                    var crackedTiles = this.tileset.getCrackedTiles();
                    arr.push(crackedTiles[~~this.rnd.nextBetween(0, crackedTiles.length)]);
                }
                else
                    arr.push(129);
            }
            // base of the wall
            arr.push(160);
            return arr;
        }
        if (c.b == 1 && c.r == 1) {
            // corner
            arr.push(98);
            // remainder of the wall
            this.addTimes(arr, 130, wallHeight);
            // base of the wall
            arr.push(162);
            return arr;
        }
        if (c.b == 1 && c.l > 1 && c.r > 1) {
            // crenelations
            if (crenelationPattern == CrenelationPatternEnum.None)
                arr.push(97);
            else if (crenelationPattern == CrenelationPatternEnum.Step)
                if (c.l % 2 == 0)
                    arr.push(5);
                else
                    arr.push(6);
            else if (crenelationPattern == CrenelationPatternEnum.ZigZag)
                if (c.l % 3 == 0)
                    arr.push(10);
                else if (c.l % 3 == 1)
                    arr.push(97);
                else
                    arr.push(11);
            else if (crenelationPattern == CrenelationPatternEnum.CurvedStep)
                if (c.l % 2 == 0)
                    arr.push(37);
                else
                    arr.push(38);
            // remainder of the wall
            for (var j = 0; j < wallHeight; j++) {
                if (this.rnd.next() < wallData.wallCrackPercentage) {
                    var crackedTiles = this.tileset.getCrackedTiles();
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
            else if (c.t % 2 == 0)
                arr.push(134);
            else
                arr.push(166);
            return arr;
        }
        // left wall
        if (c.l == 1 && c.b > 1) {
            if (crenelationPattern == CrenelationPatternEnum.None)
                arr.push(64);
            else if (c.t % 2 == 0)
                arr.push(133);
            else
                arr.push(165);
            return arr;
        }
        // (outer corner) left bottom top
        if (c.lb == 1 && c.b > 1 && c.l > 1)
            return [4];
        // (outer corner) right bottom top
        if (c.rb == 1 && c.b > 1 && c.r > 1)
            return [3];
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
    };
    /**
     * Draws the filler between the outer and inner wall
     */
    Main.prototype.drawWallPlanks = function (c, x, y, innerCells, thickness, wallHeight, baseHeight) {
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
    };
    /**
     * Draws the outer wall decorations like windows and banners
     */
    Main.prototype.drawOuterWallDecorations = function (c, x, y, wallData) {
        // if we're at the bottom of the wall, that means all tiles have already been processed
        // above, so we can draw the banners / windows over it
        if ((c.b == 1 && c.l > 1 && c.r > 1)) {
            var windowHeight = wallData.windowHeight;
            var bannerHeight = 1;
            var layerWindow = wallData.baseHeight + wallData.wallHeight + windowHeight + 0.5;
            var layerBanner = wallData.baseHeight + wallData.wallHeight + bannerHeight + 0.5;
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
    };
    /**
     * Draws a wall entrance in the middle of the lowest wall
     *
     */
    Main.prototype.drawWallEntrances = function (c, x, y, wallData, wallBounds) {
        if (y != wallBounds.y + wallBounds.height - 1)
            return;
        if (wallData.entranceType == EntranceTypeEnum.Large && (c.b == 1 && c.l > 1 && c.r > 1) && (c.l - 7 == c.r || (c.l - 6 == c.r))) {
            // x-6 because walls are being drawn too, the next tile would otherwise
            // overwrite the door tiles here
            if (c.l > 6 && c.r > 6)
                this.renderer.drawTiles(262, x - 6, y + wallData.wallHeight - 3, 6, 5, wallData.baseHeight + 5 + 0.5, true);
        }
        else if (wallData.entranceType != EntranceTypeEnum.None && (c.b == 1 && c.l > 1 && c.r > 1) && (c.l - 1 == c.r || (c.l - 2 == c.r))) {
            // x-2 because walls are being drawn too, the next tile would otherwise
            // overwrite the door tiles here
            this.renderer.drawTiles(421, x - 2, y + wallData.wallHeight - 1, 3, 3, wallData.baseHeight + 3 + 0.4, true);
        }
    };
    /**
     * Draw the inner wall decorations, such as planks sticking out
     *
     */
    Main.prototype.drawInnerWallDecorations = function (c, x, y, wallData) {
        // only at the top of the wall
        if ((c.t == 1 && c.l > 1 && c.r > 1)) {
            var relativeY = 1;
            var layer = wallData.baseHeight + wallData.wallHeight + relativeY + 0.5;
            if (this.rnd.next() < wallData.innerWallPlankPercentage) {
                var plankTiles = this.tileset.getPlankDecorationTiles();
                this.renderer.drawTile(plankTiles[~~this.rnd.nextBetween(0, plankTiles.length)], x, y + relativeY, layer);
            }
        }
    };
    /**
     * Draws the towers at the lower left/right bottom of the wall
     *
     */
    Main.prototype.drawFrontTowers = function (step, towerHeight, wallArea, wallData) {
        var wallHeight = wallData.wallHeight;
        var baseOffset = 2;
        // iterate over all tower points
        for (var _i = 0, _a = wallData.towerPoints; _i < _a.length; _i++) {
            var pt = _a[_i];
            var xx = pt.x;
            var yy = pt.y;
            var c = wallData.cells[xx][yy];
            // tower offset so it's centered on the corner
            var towerOffsetX = 0;
            if (c.r == 1 && c.b == 1)
                towerOffsetX = -1;
            var towerOffsetY = 0;
            var x = xx + towerOffsetX;
            var y = yy + towerOffsetY;
            // for all tiles on the bottom corners
            if ((c.l == 1 && c.b == 1) || (c.r == 1 && c.b == 1)) {
                // base wall of tower
                for (var k = 0; k < wallHeight + baseOffset; k++)
                    this.renderer.drawTiles(236, x - 1, y + k, 4, 1, wallData.baseHeight + wallHeight + baseOffset - k + 2, false);
                // base bottom of tower
                this.renderer.drawTiles(268, x - 1, y + wallHeight + baseOffset, 4, 1, wallData.baseHeight + 2, false);
                this.renderer.drawTiles(300, x - 1, y + wallHeight + baseOffset + 1, 4, 1, wallData.baseHeight + 1, false);
                // remaining top
                var remaining = towerHeight - wallHeight - baseOffset - 1;
                for (var k = 0; k < remaining; k++)
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
    };
    /**
     * Draws the back towers at the top corners of the wall
     *
     */
    Main.prototype.drawBackTowers = function (step, towerHeight, a, wallData) {
        var wallHeight = wallData.wallHeight;
        var baseOffset = 0;
        for (var _i = 0, _a = wallData.towerPoints; _i < _a.length; _i++) {
            var pt = _a[_i];
            var xx = pt.x;
            var yy = pt.y;
            var c = wallData.cells[xx][yy];
            var towerOffsetX = 0;
            if (c.r == 1 && c.t == 1)
                towerOffsetX = -1;
            var towerOffsetY = 0;
            var x = xx + towerOffsetX;
            var y = yy + towerOffsetY;
            // only on the top corners of the wall
            if ((c.l == 1 && c.t == 1) || (c.r == 1 && c.t == 1)) {
                var left = (c.r == 1 && c.t == 1);
                // base wall of tower
                for (var k = 0; k < wallHeight + baseOffset; k++)
                    this.renderer.drawTiles(236, x - 1, y + k, 4, 1, wallData.baseHeight + wallHeight + baseOffset - k + 2, false);
                // base bottom of tower
                this.renderer.drawTiles(268, x - 1, y + wallHeight + baseOffset, 4, 1, wallData.baseHeight + 2, false);
                this.renderer.drawTiles(300, x - 1, y + wallHeight + baseOffset + 1, 4, 1, wallData.baseHeight + 1, false);
                var remaining = towerHeight - wallHeight - baseOffset - 1;
                for (var k = 0; k < remaining; k++) {
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
    };
    /**
     * Draws the round tower roof at given position
     *
     */
    Main.prototype.drawRoundTowerRoof = function (x, y, remaining, curHeight) {
        var baseRoof = 352;
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 4; j++) {
                if (j == 0 || j == 3) {
                    if (i > 1 && i < 5)
                        this.renderer.drawTile(baseRoof + i - j * this.tileset.cols, x - 2 + i, y - remaining - 2 - j, curHeight + j);
                }
                else
                    this.renderer.drawTile(baseRoof + i - j * this.tileset.cols, x - 2 + i, y - remaining - 2 - j, curHeight + j);
            }
        }
    };
    /**
     * Accumulates all the data necessary to place down the inner building.
     * The actual area for the building is shrunk from the outer wall area
     * so it has the same shape as the outside wall
     */
    Main.prototype.generateInnerBuildingArea = function (step, wallArea, outerWallData, spacing, innerBuildingHeight) {
        var aCells = wallArea.getDistanceCells();
        var buildingArea = this.getShrunkArea(wallArea, aCells, spacing);
        // clean up the area and shift it up so it never overlaps with
        // the bottom wall
        // this means the building is not actually centered in the castle
        // but it makes the courtyard larger on the bottom, where the 
        // decorations are actually seen
        buildingArea.cleanUp(10);
        buildingArea.shiftUp(innerBuildingHeight);
        var buildingCells = buildingArea.getDistanceCells();
        return new InnerBuildingData(buildingCells, buildingArea);
    };
    /**
     * Draws the inner building with given data
     *
     */
    Main.prototype.drawInnerBuilding = function (step, outerWallArea, outerWallData, innerBuildingData) {
        this.generateInnerBuilding(step, outerWallArea, outerWallData, innerBuildingData, this.settings.innerBuildingStorySpacing, this.settings.innerBuildingHeight, this.settings.crenelationPattern, this.settings.windowType, this.settings.windowSpacing, this.settings.windowHeight, this.settings.innerBuildingEntranceType, 0);
    };
    /**
     * Recursively draw a wall with no inner area, with each time a smaller version
     * on top of itself. This becomes the main inner building. This reuses the wall generation
     * and thus can have all the features walls have like towers, decorations etc
     */
    Main.prototype.generateInnerBuilding = function (step, outerWallArea, outerWallData, innerBuildingData, storySpacing, innerBuildingHeight, crenelationPattern, windowType, windowSpacing, windowHeight, entranceType, curStory) {
        if (step >= StepEnum.BuildingArea) {
            // draw the building area
            if (step != StepEnum.Done)
                this.drawArea(innerBuildingData.buildingArea, "blue");
            // determine which height we're on 
            var baseHeight = 0;
            // if the outer walls had no inner area (= no courtyard area) then the base height is already the wall height
            if (this.settings.noCourtyardArea)
                baseHeight += outerWallData.wallHeight + 1;
            // increase the height for each story of the building
            baseHeight += curStory * (innerBuildingHeight + 1);
            // generate the wall data for the building (without inner wall)
            var buildingWallData = this.generateWalls(step, innerBuildingData.buildingArea, Number.POSITIVE_INFINITY, innerBuildingHeight, this.settings.innerBuildingTowerType, crenelationPattern, this.settings.windowType, this.settings.windowSpacing, windowHeight, this.settings.innerBuildingEntranceType, this.settings.bannerType, this.settings.bannerSpacing, this.settings.wallCrackPercentage, 0, baseHeight);
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
                var storyBuildingData = this.generateInnerBuildingArea(step, innerBuildingData.buildingArea, outerWallData, storySpacing, innerBuildingHeight);
                this.generateInnerBuilding(step, innerBuildingData.buildingArea, outerWallData, storyBuildingData, storySpacing, innerBuildingHeight, crenelationPattern, windowType, windowSpacing, windowHeight, entranceType, curStory + 1);
            }
        }
    };
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
    Main.prototype.drawCourtyardDecorations = function (step, outerWallArea, outerWallData, innerBuildingData) {
        // determine the inner building area to subtract, again shift it 
        // down with its wall height to prevent the wall being included 
        // in the courtyard area
        var innerBuildingArea = innerBuildingData.buildingArea.clone();
        innerBuildingArea.shiftDown(this.settings.innerBuildingHeight + 2);
        // determine the courtyard area, shift it down with the wall height
        // so the outerwall is not included, then subtract the inner building area from it
        var courtyardArea = outerWallData.innerArea.clone();
        var courtyardCells = courtyardArea.getDistanceCells();
        courtyardArea.shiftDown(this.settings.wallHeight + 2);
        courtyardArea.subtract(innerBuildingArea);
        courtyardArea = this.getShrunkArea(courtyardArea, courtyardCells, 2);
        // draw the courtyard area
        if (step >= StepEnum.CourtyardArea && step != StepEnum.Done)
            this.drawArea(courtyardArea, "yellow");
        var districtPointPadding = 5;
        var districtPadding = 2;
        // determine the bounds and take the distance between sampling
        // points about half the width, that means that there will only
        // be a few districts (either width or height doesn't really matter,
        // the area is mostly square anyway)
        var courtyardBounds = courtyardArea.getBounds();
        var districtsDistance = courtyardBounds.width / 2;
        // if there's no courtyard distance, bail out
        if (districtsDistance <= 0)
            return;
        // determine the initial point 
        var pt = null;
        for (var i = 0; i < this.width && pt == null; i++) {
            for (var j = 0; j < this.height && pt == null; j++) {
                var c = courtyardCells[i][j];
                if (c.l > districtPointPadding && c.r > districtPointPadding && Math.abs(c.l - c.r) > 10)
                    pt = new Point(i, j);
            }
        }
        if (pt == null)
            return;
        // setup a poisson disc sampling inside the courtyard area
        var pd = new Sampling.PoissonDisc(this.width, this.height, districtsDistance, 200, this.rnd, function (x, y) {
            return courtyardArea.getMask(x, y);
        });
        // add the initial sample
        pd.addInitialSample(pt.x, pt.y);
        // run until it's done
        while (!pd.isDone) {
            pd.step();
        }
        // convert the samples to points
        var pts = [];
        for (var _i = 0, _a = pd.samples; _i < _a.length; _i++) {
            var s = _a[_i];
            pts.push(new Point(s.x, s.y));
        }
        // determine the different areas with voronoi
        var areas = courtyardArea.splitUpWithVoronoi(pts);
        // determine the inverse of the courtyard area, this will 
        // need to be subtracted from each district area
        var courtyardInverse = courtyardArea.clone();
        courtyardInverse.invert();
        var districtColors = ["red", "green", "blue", "yellow", "cyan", "magenta", "purple", "gray", "orange", "brown"];
        for (var i = 0; i < areas.length; i++) {
            var ar = areas[i];
            // subtract the courtyard inverse
            ar.subtract(courtyardInverse);
            // and clean up any chunks < 10 tiles
            ar.cleanUp(10);
            // shrink the area a bit so there's some spacing 
            // between them
            var arCells = ar.getDistanceCells();
            areas[i] = this.getShrunkArea(ar, arCells, 2);
            // draw the district
            if (step >= StepEnum.CourtyardDistricts && step != StepEnum.Done)
                this.drawArea(ar, districtColors[i % districtColors.length]);
        }
        // draw the district points
        if (step >= StepEnum.CourtyardDistricts && step != StepEnum.Done) {
            this.ctx.fillStyle = "black";
            for (var _b = 0; _b < pts.length; _b++) {
                var pt_1 = pts[_b];
                this.ctx.fillRect(pt_1.x * this.cx, pt_1.y * this.cy, this.cx, this.cy);
            }
        }
        for (var i = 0; i < areas.length; i++) {
            var districtArea = areas[i];
            // for each of the districts draw either a park or building
            if (this.rnd.next() < this.settings.courtyardParkPercentage)
                this.drawCourtyardPark(step, districtArea);
            else
                this.drawCourtyardBuildings(step, districtArea);
        }
    };
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
    Main.prototype.drawCourtyardBuildings = function (step, districtArea) {
        if (step < StepEnum.CourtyardBuildingsAreas)
            return;
        // use some spacing between the buildings
        var rectanglePadding = this.settings.courtyardBuildingSpacing;
        // constrain the min & max cell size to not have huge or tiny
        // rectangles
        var minCellWidth = 8 + rectanglePadding;
        var minCellHeight = 10;
        var maxCellWidth = 15 + rectanglePadding;
        var maxCellHeight = 10;
        // determine a random cell width & height
        var cellWidth = minCellWidth + Math.floor(this.rnd.next() * (maxCellWidth - minCellWidth));
        var cellHeight = minCellHeight + Math.floor(this.rnd.next() * (maxCellHeight - minCellHeight));
        // determine the largest rectangle possible in the area
        var innerBounds = districtArea.getLargestRectangle();
        var bounds = districtArea.getBounds();
        // determine the columns & rows of the overlaid grid
        var cols = Math.floor(bounds.width / cellWidth);
        var rows = Math.floor(bounds.height / cellHeight);
        // build an array of rectangles for each row and column
        var rectanglesOfColumns = new Array(cols);
        var rectanglesOfRows = new Array(rows);
        for (var i = 0; i < cols; i++)
            rectanglesOfColumns[i] = [];
        for (var i = 0; i < rows; i++)
            rectanglesOfRows[i] = [];
        // keep track of the smaller rectangles as well
        var smallerRectangles = [];
        for (var x = 0; x < cols; x++) {
            for (var y = 0; y < rows; y++) {
                // extract the area for the cell
                // the sub area is relative positioned, so it
                // will go from 0 to subArea.width & same for height
                var subArea = districtArea.getSubArea(new Rectangle(bounds.x + x * cellWidth, bounds.y + y * cellHeight, cellWidth, cellHeight));
                // determine its boundaries
                var subBounds = subArea.getBounds();
                if (subBounds.width > 0 && subBounds.height > 0) {
                    // get the larges possible rectangle for the cell
                    var innerSubbounds = subArea.getLargestRectangle();
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
        var finalRectanglesForBuildings = [];
        for (var j = 0; j < rows; j++) {
            for (var i = 0; i < rectanglesOfRows[j].length; i++) {
                var r1 = rectanglesOfRows[j][i];
                // if the rectangle has to be merged with the one next to it (if there is still one)
                if (this.rnd.next() < this.settings.courtyardLargeBuildingPercentage && i + 1 < rectanglesOfRows[j].length) {
                    var r2 = rectanglesOfRows[j][i + 1];
                    // check if the rectangle is actually the same size and on the same top
                    // otherwise you'd get a bounds that's larger than both and can spill outside the area
                    // also make sure the rectangles are somewhat close by next to each other
                    if (r1.y == r2.y && r1.height == r2.height && Math.abs(r2.x - r1.x) < r1.x + r2.x) {
                        finalRectanglesForBuildings.push(Rectangle.fromLTRB(r1.x, r1.y, r2.x + r2.width - 1, r2.y + r2.height - 1));
                        i += 1;
                    }
                    else
                        finalRectanglesForBuildings.push(r1);
                }
                else
                    finalRectanglesForBuildings.push(r1);
            }
        }
        var districtCells = districtArea.getDistanceCells();
        // draw the district base floor, don't  include any grass in the middle
        if (step >= StepEnum.CourtyardStructures)
            this.drawDistrictBaseFloor(districtArea, districtCells, Number.MAX_VALUE);
        // for all of the rectangles that are large enough for buildings
        for (var _i = 0; _i < finalRectanglesForBuildings.length; _i++) {
            var r = finalRectanglesForBuildings[_i];
            // draw the outline
            if (step >= StepEnum.CourtyardBuildingsAreas && step != StepEnum.Done)
                this.drawRectangle(r, "rgba(0,0,0,0.5)");
            // draw the actual building
            if (step >= StepEnum.CourtyardStructures) {
                this.drawCourtyardBuildingAt(r.x, r.y, r.width, r.height);
            }
        }
        // for all remaining smaller rectangles, draw decorations
        for (var _a = 0; _a < smallerRectangles.length; _a++) {
            var r = smallerRectangles[_a];
            // draw the outline
            if (step >= StepEnum.CourtyardBuildingsAreas && step != StepEnum.Done)
                this.drawRectangle(r, "rgba(0,0,0,0.5)");
            if (step >= StepEnum.CourtyardStructures) {
                // draw crates
                this.renderer.drawTiles(923, this.rnd.nextBetween(r.x, r.x + r.width - 2), this.rnd.nextBetween(r.y, r.y + r.height - 2), 2, 2, 1, false);
            }
        }
    };
    /**
     * Draws the district floor by using the distance cells
     * Any border can be easily mapped onto the border stone tiles,
     * similar to how the walls are drawn
     */
    Main.prototype.drawDistrictBaseFloor = function (districtArea, districtCells, stoneWidth) {
        for (var i = 0; i < districtArea.w; i++) {
            for (var j = 0; j < districtArea.h; j++) {
                if (districtArea.getMask(i, j)) {
                    var c = districtCells[i][j];
                    // left top
                    if (c.t == 1 && c.l == 1)
                        this.renderer.drawTile(633, i, j, 0);
                    else if (c.t == 1 && c.r == 1)
                        this.renderer.drawTile(635, i, j, 0);
                    else if (c.t == 1)
                        this.renderer.drawTile(634, i, j, 0);
                    else if (c.b == 1 && c.t == 1 && c.r == 1) { }
                    else if (c.b == 1 && c.l == 1 && c.r == 1) { }
                    else if (c.b == 1 && c.l == 1)
                        this.renderer.drawTile(697, i, j, 0);
                    else if (c.b == 1 && c.r == 1)
                        this.renderer.drawTile(699, i, j, 0);
                    else if (c.b == 1)
                        this.renderer.drawTile(698, i, j, 0);
                    else if (c.l == 1)
                        this.renderer.drawTile(665, i, j, 0);
                    else if (c.r == 1)
                        this.renderer.drawTile(667, i, j, 0);
                    else if (c.l < stoneWidth || c.r < stoneWidth || c.t < stoneWidth || c.b < stoneWidth ||
                        c.lt < stoneWidth || c.rt < stoneWidth || c.lb < stoneWidth || c.rb < stoneWidth)
                        this.renderer.drawTile(666, i, j, 0);
                    else
                        this.renderer.drawTile(603, i, j, 0);
                }
            }
        }
    };
    /**
     * Draws a courtyard building at the specified position within the length & depth given
     *
     */
    Main.prototype.drawCourtyardBuildingAt = function (x, y, lengthModifier, depthModifier) {
        var height = 6;
        var depth = depthModifier - 3; // minimum 3
        var length = lengthModifier; // minimum 7
        var rooftiles = [525, 526, 557, 558];
        // top left of roof
        this.renderer.drawTile(513, x + 1, y, height);
        this.renderer.drawTile(544, x, y + 1, height);
        this.renderer.drawTile(545, x + 1, y + 1, height);
        // top right of roof
        this.renderer.drawTile(522, x + length - 1, y, height);
        this.renderer.drawTile(554, x + length - 1, y + 1, height);
        this.renderer.drawTile(555, x + length, y + 1, height);
        // sides of roof
        for (var j = 2; j < depth - 1; j++) {
            this.renderer.drawTile(864 + (j % 2) * this.tileset.cols, x, y + j, height);
            this.renderer.drawTile(865 + (j % 2) * this.tileset.cols, x + 1, y + j, height);
            this.renderer.drawTile(869 + (j % 2) * this.tileset.cols, x + length, y + j, height);
            this.renderer.drawTile(868 + (j % 2) * this.tileset.cols, x + length - 1, y + j, height);
        }
        // roof itself
        for (var i = 0; i < length - 3; i++) {
            this.renderer.drawTile(514, x + i + 2, y, height);
            for (var j = 1; j < depth - 1; j++)
                this.renderer.drawTile(rooftiles[~~this.rnd.nextBetween(0, rooftiles.length)], x + i + 2, y + j, height);
        }
        // left of house
        this.renderer.drawTiles(608, x, y + depth - 1, 2, 3, height - 1, false);
        this.renderer.drawTiles(704, x, y + depth - 1 + 3, 2, 3, 3, true);
        // right of house
        this.renderer.drawTiles(618, x + length - 1, y + depth - 1, 2, 3, height - 1, false);
        this.renderer.drawTiles(714, x + length - 1, y + depth - 1 + 3, 2, 3, 3, true);
        // front wall
        for (var i = 0; i < length - 3; i += 2) {
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
        var range = x + length - 5 - (x + 2);
        var middle = (x + 2) + (~~(this.rnd.next() * (range / 2))) * 2;
        //let middle = ~~this.rnd.nextBetween(x + 2, x + length - 5);
        this.renderer.drawTiles(612, middle, y + depth - 1, 4, 6, height + 0.4, true);
        // sign
        var signPos = this.rnd.next() < 0.5 ? middle - 1 : middle + 4;
        var signTiles = this.tileset.getBuildingSignDecorationTiles();
        var signTile = signTiles[~~this.rnd.nextBetween(0, signTiles.length)];
        this.renderer.drawTile(signTile, signPos, y + depth + 2, 3 + 0.5);
        // lantern
        this.renderer.drawTiles(780, middle + (this.rnd.next() < 0.5 ? 0 : 2), y + depth + 3, 2, 1, 2 + 0.5);
        // add decorations on the left and right side
        this.drawCourtyardBuildingDecoration(x, y, depth, length, true);
        this.drawCourtyardBuildingDecoration(x, y, depth, length, false);
    };
    /**
     * Draw random building decorations on the side of the building
     *
     */
    Main.prototype.drawCourtyardBuildingDecoration = function (xx, y, depth, length, left) {
        var x = xx + (left ? 0 : length);
        // decoration of sides of house
        // little decoration
        if (this.rnd.next() < 0.5) {
            var tinyTiles = this.tileset.getBuildingSideTinyDecorationTiles();
            // there's room for 3 little decorations
            for (var j = ~~this.rnd.nextBetween(0, 2); j < 3; j++) {
                var rndTile = tinyTiles[~~this.rnd.nextBetween(0, tinyTiles.length)];
                this.renderer.drawTile(rndTile, x, y + depth + 2 + j, 1);
            }
        }
        else if (this.rnd.next() < 0.5) {
            var largeTiles = this.tileset.getBuildingSideLargeDecorationTiles();
            var largeRndTile = largeTiles[~~this.rnd.nextBetween(0, largeTiles.length)];
            this.renderer.drawTiles(largeRndTile, x, y + depth + 2 + (this.rnd.next() < 0.5 ? 0 : 1), 1, 2, 2, true);
        }
    };
    /**
     * Draws the courtyard park in a district area
     * It does the same base floor drawing as with the buildings district
     * But it also adds 2 poisson disc sampling to draw tiny decorations
     * and large ones (tree / well)
     *
     */
    Main.prototype.drawCourtyardPark = function (step, districtArea) {
        if (step < StepEnum.CourtyardStructures)
            return;
        var cells = districtArea.getDistanceCells();
        var stoneWidth = this.settings.courtyardParkStoneBorderWidth;
        // draw the floor
        this.drawDistrictBaseFloor(districtArea, cells, stoneWidth);
        // determine the inner grass area
        var innerArea = this.getShrunkArea(districtArea, cells, stoneWidth + 2);
        var innerBounds = innerArea.getBounds();
        if (this.settings.courtyardParkRenderDecoration) {
            // setup poisson disc sampling for tiny decorations
            var distance = 3;
            var pd = new Sampling.PoissonDisc(this.width, this.height, distance, 200, this.rnd, function (x, y) {
                return innerArea.getMask(x, y);
            });
            // use the middle of the area as initial sample
            pd.addInitialSample(innerBounds.x + ~~(innerBounds.width / 2), innerBounds.y + ~~(innerBounds.height / 2));
            // generate samples
            while (!pd.isDone) {
                pd.step();
            }
            // on each of the samples, draw a random park decoration
            var parkSmallTiles = this.tileset.getCourtyardParkDecorationTiles();
            for (var _i = 0, _a = pd.samples; _i < _a.length; _i++) {
                var s = _a[_i];
                this.renderer.drawTile(parkSmallTiles[~~this.rnd.nextBetween(0, parkSmallTiles.length)], s.x, s.y, 1);
            }
            // setup poisson disc sampling for large decorations
            distance = 4;
            pd = new Sampling.PoissonDisc(this.width, this.height, distance, 200, this.rnd, function (x, y) {
                return innerArea.getMask(x, y);
            });
            // again use the middle of the area as initial sample
            pd.addInitialSample(innerBounds.x + ~~(innerBounds.width / 2), innerBounds.y + ~~(innerBounds.height / 2));
            // generate samples
            while (!pd.isDone) {
                pd.step();
            }
            // draw large decorations on the sample points
            for (var _b = 0, _c = pd.samples; _b < _c.length; _b++) {
                var s = _c[_b];
                if (this.rnd.next() < this.settings.courtyardParkWellPercentage) {
                    this.renderer.drawTiles(827, s.x, s.y, 2, 2, 1, false);
                }
                else {
                    this.renderer.drawTiles(880, s.x, s.y - 5, 4, 3, 4, true);
                    this.renderer.drawTiles(977, s.x + 1, s.y - 5 + 3, 2, 2, 1, false);
                }
            }
        }
    };
    /**
     * Adds the given value n times to the array
     *
     */
    Main.prototype.addTimes = function (arr, val, times) {
        for (var i = 0; i < times; i++)
            arr.push(val);
    };
    /**
     * Clears the canvas and renderer
     *
     */
    Main.prototype.clear = function () {
        this.renderer.clear();
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    /**
     * Creates an area from a base area that's contracted with a given padding
     *
     */
    Main.prototype.getShrunkArea = function (area, cells, padding) {
        var innerArea = area.clone();
        for (var x = 0; x < area.w; x++) {
            for (var y = 0; y < area.h; y++) {
                var c = cells[x][y];
                if (c.t <= padding || c.b <= padding || c.l <= padding || c.r <= padding ||
                    c.lt <= padding || c.lb <= padding || c.rt <= padding || c.rb <= padding)
                    innerArea.setMask(x, y, false);
            }
        }
        return innerArea;
    };
    /**
     * Draws a rectangle with given color
     *
     */
    Main.prototype.drawRectangle = function (r, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(r.x * this.cx, r.y * this.cy, r.width * this.cx, r.height * this.cy);
    };
    /**
     * Draws an area with given color
     *
     */
    Main.prototype.drawArea = function (a, color) {
        this.ctx.fillStyle = color;
        for (var x = 0; x < a.w; x++) {
            for (var y = 0; y < a.h; y++) {
                if (a.getMask(x, y))
                    this.ctx.fillRect(x * this.cx, y * this.cy, this.cx, this.cy);
            }
        }
    };
    /**
     * Checks if a value is between the min and max
     *
     */
    Main.prototype.between = function (val, min, max) {
        return val > min && val <= max;
    };
    /**
     * Draws a grid between tiles
     */
    Main.prototype.drawGrid = function () {
        for (var j = 0; j < this.height; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j * this.cy);
            this.ctx.lineTo(this.width * this.cx, j * this.cy);
            this.ctx.stroke();
        }
        for (var i = 0; i < this.width; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cx, 0);
            this.ctx.lineTo(i * this.cx, this.height * this.cy);
            this.ctx.stroke();
        }
    };
    return Main;
})();
var WallData = (function () {
    function WallData(outerArea, cells, innerArea, innerCells, thickness, wallHeight, towerPoints, towerType, crenelationPattern, windowType, windowSpacing, windowHeight, entranceType, bannerType, bannerSpacing, wallCrackPercentage, innerWallPlankPercentage, baseHeight) {
        this.outerArea = outerArea;
        this.cells = cells;
        this.innerArea = innerArea;
        this.innerCells = innerCells;
        this.thickness = thickness;
        this.wallHeight = wallHeight;
        this.towerPoints = towerPoints;
        this.towerType = towerType;
        this.crenelationPattern = crenelationPattern;
        this.windowType = windowType;
        this.windowSpacing = windowSpacing;
        this.windowHeight = windowHeight;
        this.entranceType = entranceType;
        this.bannerType = bannerType;
        this.bannerSpacing = bannerSpacing;
        this.wallCrackPercentage = wallCrackPercentage;
        this.innerWallPlankPercentage = innerWallPlankPercentage;
        this.baseHeight = baseHeight;
    }
    return WallData;
})();
var InnerBuildingData = (function () {
    function InnerBuildingData(cells, buildingArea) {
        this.cells = cells;
        this.buildingArea = buildingArea;
    }
    return InnerBuildingData;
})();
var Tile = (function () {
    function Tile(idx, x, y, layer, showLayerDebug) {
        if (showLayerDebug === void 0) { showLayerDebug = false; }
        this.idx = idx;
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.showLayerDebug = showLayerDebug;
    }
    Tile.prototype.compareTo = function (other) {
        return this.layer - other.layer;
    };
    Tile.prototype.getKey = function () {
        return this.idx + "_" + this.x + "_" + this.y + "_" + this.layer;
    };
    return Tile;
})();
/**
 * The renderer keeps track of a "z-buffer" so the tiles are always rendered from
 * lower layer to upper layer, regardless of the order the drawTile was made
 * The only exception is layer 0, which is drawn immediately because it's the lowest layer
 * and for performance reason. Putting that many tiles in the priority queue is expensive
 *
 */
var Renderer = (function () {
    function Renderer(tileset, c, ctx, cx, cy) {
        this.tileset = tileset;
        this.c = c;
        this.ctx = ctx;
        this.cx = cx;
        this.cy = cy;
        this.renderQueue = new DataStructs.PriorityQueue();
    }
    /**
     * Draws a tile with given index on the given position and on the given layer
     *
     */
    Renderer.prototype.drawTile = function (tilesetIdx, x, y, layer, showLayerDebug) {
        if (layer === void 0) { layer = 0; }
        if (showLayerDebug === void 0) { showLayerDebug = false; }
        // if it's the base layer, then render it directly, it'll be most
        // of the tiles and it needs to be renderered first anyway, this
        // way the queue won't be huge with 0 layer tiles
        if (layer == 0)
            this.drawT(tilesetIdx, x, y);
        else {
            var t = new Tile(tilesetIdx, x, y, layer, showLayerDebug);
            if (!this.renderQueue.contains(t.getKey()))
                this.renderQueue.enqueue(t);
        }
    };
    Renderer.prototype.drawT = function (idx, x, y) {
        var srcX = idx % this.tileset.cols;
        var srcY = Math.floor(idx / this.tileset.cols);
        this.ctx.drawImage(this.tileset.tilesetImage, srcX * TILE_WIDTH, srcY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, x * this.cx, y * this.cy, this.cx, this.cy);
    };
    /**
     * Draws tiles that are next to each other in the tileset
     * If decreateLayerWithY it will decrease the layer for each tile vertically. This
     * is handy for vertical structures like walls, banners, etc.
     *
     */
    Renderer.prototype.drawTiles = function (tilesetIdx, x, y, srcWidth, srcHeight, layer, decreaseLayerWithY, showLayerDebug) {
        if (layer === void 0) { layer = 0; }
        if (decreaseLayerWithY === void 0) { decreaseLayerWithY = false; }
        if (showLayerDebug === void 0) { showLayerDebug = false; }
        var srcX = tilesetIdx % this.tileset.cols;
        var srcY = Math.floor(tilesetIdx / this.tileset.cols);
        var curLayer = layer;
        for (var i = 0; i < srcWidth; i++) {
            for (var j = 0; j < srcHeight; j++) {
                // determine current layer
                if (decreaseLayerWithY)
                    curLayer = layer - j;
                // determine the tileset index of the current tile
                var srcIdx = (srcY + j) * this.tileset.cols + (srcX + i);
                if (curLayer <= 0)
                    this.drawT(srcIdx, x + i, y + j);
                else {
                    var t = new Tile(srcIdx, x + i, y + j, curLayer, showLayerDebug);
                    if (!this.renderQueue.contains(t.getKey()))
                        this.renderQueue.enqueue(t);
                }
            }
        }
    };
    /**
     * Clears the rendering queue
     *
     */
    Renderer.prototype.clear = function () {
        this.renderQueue = new DataStructs.PriorityQueue();
    };
    /**
     * Processes the rendering queue, by drawing all the tiles
     * Iterating (which takes the heap & sorts it) is faster than dequeueing
     * Both are O(n log n) but sort is significantly more optimized
     */
    Renderer.prototype.finalize = function () {
        var _this = this;
        this.renderQueue.foreach(function (t) {
            _this.drawT(t.idx, t.x, t.y);
            // draw the layer info if required
            if (SHOW_ALL_LAYER_DEBUG || t.showLayerDebug) {
                var val = Math.round(t.layer * 100) / 100;
                var metrics = _this.ctx.measureText(val + "");
                _this.ctx.fillStyle = "red";
                _this.ctx.fillRect(t.x * _this.cx + 5 - 2, t.y * _this.cy + _this.cy / 2 - 8, metrics.width + 4, 8);
                _this.ctx.fillStyle = "black";
                _this.ctx.fillText(val + "", t.x * _this.cx + 5, t.y * _this.cy + _this.cy / 2);
            }
        });
    };
    return Renderer;
})();
var Tileset = (function () {
    function Tileset(c, ctx, cx, cy) {
        this.c = c;
        this.ctx = ctx;
        this.cx = cx;
        this.cy = cy;
        this.tilesetImage = document.getElementById("tileset");
        this.cols = 1024 / TILE_WIDTH;
        this.rows = 1024 / TILE_HEIGHT;
        this.overlay = document.getElementById("tilesetOverlay");
        this.oCtx = this.overlay.getContext("2d");
        this.overlay.width = this.tilesetImage.width;
        this.overlay.height = this.tilesetImage.height;
        this.drawTilesetOverlay();
    }
    Tileset.prototype.drawTilesetOverlay = function () {
        this.oCtx.font = "15px Tahoma";
        for (var j = 0; j < this.rows; j++) {
            for (var i = 0; i < this.cols; i++) {
                var idx = j * this.cols + i;
                this.oCtx.fillText(idx + "", (i + 0.1) * TILE_WIDTH, (j + 0.5) * TILE_HEIGHT);
            }
        }
        for (var j = 0; j < this.rows; j++) {
            this.oCtx.beginPath();
            this.oCtx.moveTo(0, j * TILE_HEIGHT);
            this.oCtx.lineTo(this.cols * TILE_WIDTH, j * TILE_HEIGHT);
            this.oCtx.stroke();
        }
        for (var i = 0; i < this.rows; i++) {
            this.oCtx.beginPath();
            this.oCtx.moveTo(i * TILE_WIDTH, 0);
            this.oCtx.lineTo(i * TILE_HEIGHT, this.rows * TILE_HEIGHT);
            this.oCtx.stroke();
        }
    };
    Tileset.prototype.getCrackedTiles = function () {
        return [99, 100, 131, 132, 163, 164, 193, 225];
    };
    Tileset.prototype.getPlankDecorationTiles = function () {
        return [226, 227, 228];
    };
    Tileset.prototype.getBuildingSignDecorationTiles = function () {
        return [940, 941, 942, 943, 972, 973, 974, 975, 1004];
    };
    Tileset.prototype.getBuildingSideTinyDecorationTiles = function () {
        return [922, 885, 890, 891, 892, 893, 894, 985, 1017];
    };
    Tileset.prototype.getBuildingSideLargeDecorationTiles = function () {
        return [976, 986, 991, 927];
    };
    Tileset.prototype.getCourtyardParkDecorationTiles = function () {
        return [629, 630, 884, 661, 662, 693, 694];
    };
    return Tileset;
})();
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.distanceTo = function (pt) {
        return Math.sqrt(Math.pow((pt.x - this.x), 2) + Math.pow((pt.y - this.y), 2));
    };
    return Point;
})();
var Area = (function () {
    function Area(w, h) {
        this.w = w;
        this.h = h;
        this.mask = new Array(w);
        for (var i = 0; i < w; i++) {
            this.mask[i] = new Array(h);
            for (var j = 0; j < h; j++) {
                //console.log(":" + i + "," + j)
                this.mask[i][j] = false;
            }
        }
    }
    Area.prototype.clone = function () {
        var a = new Area(this.w, this.h);
        for (var i = 0; i < this.w; i++) {
            a.mask[i] = new Array(this.h);
            for (var j = 0; j < this.h; j++) {
                a.mask[i][j] = this.mask[i][j];
            }
        }
        return a;
    };
    Area.prototype.addRectangle = function (r) {
        for (var i = 0; i < r.width; i++) {
            for (var j = 0; j < r.height; j++) {
                if (r.x + i >= 0 && r.x + i < this.w &&
                    r.y + j >= 0 && r.y + j < this.h) {
                    this.mask[r.x + i][r.y + j] = true;
                }
            }
        }
    };
    Area.prototype.clearRectangle = function (r) {
        for (var i = 0; i < r.width; i++) {
            for (var j = 0; j < r.height; j++) {
                if (r.x + i >= 0 && r.x + i < this.w &&
                    r.y + j >= 0 && r.y + j < this.h) {
                    this.mask[r.x + i][r.y + j] = false;
                }
            }
        }
    };
    Area.prototype.shiftUp = function (dy) {
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++) {
                if (j + dy < this.h)
                    this.mask[i][j] = this.mask[i][j + dy];
                else
                    this.mask[i][j] = false;
            }
        }
    };
    Area.prototype.shiftDown = function (dy) {
        for (var i = 0; i < this.w; i++) {
            for (var j = this.h - 1; j >= 0; j--) {
                if (j - dy > 0)
                    this.mask[i][j] = this.mask[i][j - dy];
                else
                    this.mask[i][j] = false;
            }
        }
    };
    Area.prototype.cleanUp = function (minSize) {
        // vertical check
        for (var i = 0; i < this.w; i++) {
            var lastEmpty = 0;
            for (var j = 0; j < this.h; j++) {
                if (!this.mask[i][j]) {
                    var newEmpty = j;
                    if (newEmpty - lastEmpty < minSize) {
                        for (var k = 0; k <= newEmpty - lastEmpty; k++) {
                            this.mask[i][lastEmpty + k] = false;
                        }
                        lastEmpty = newEmpty;
                    }
                }
            }
        }
        // horizontal check
        for (var j = 0; j < this.h; j++) {
            var lastEmpty = 0;
            for (var i = 0; i < this.w; i++) {
                if (!this.mask[i][j]) {
                    var newEmpty = i;
                    if (newEmpty - lastEmpty < minSize) {
                        for (var k = 0; k <= newEmpty - lastEmpty; k++) {
                            this.mask[lastEmpty + k][j] = false;
                        }
                        lastEmpty = newEmpty;
                    }
                }
            }
        }
    };
    Area.prototype.invert = function () {
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++)
                this.mask[i][j] = !this.mask[i][j];
        }
    };
    Area.prototype.subtract = function (a) {
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++) {
                if (a.getMask(i, j))
                    this.mask[i][j] = false;
            }
        }
    };
    Area.prototype.getSubArea = function (r) {
        var a = new Area(r.width, r.height);
        for (var i = r.x; i < r.x + r.width; i++) {
            for (var j = r.y; j < r.y + r.height; j++) {
                if (this.mask[i][j])
                    a.setMask(i - r.x, j - r.y, true);
            }
        }
        return a;
    };
    Area.prototype.getBounds = function () {
        var l = Number.MAX_VALUE;
        var r = Number.MIN_VALUE;
        var t = Number.MAX_VALUE;
        var b = Number.MIN_VALUE;
        var allUnset = true;
        for (var i = 0; i < this.w && allUnset; i++) {
            for (var j = 0; j < this.h && allUnset; j++) {
                if (this.mask[i][j]) {
                    l = i;
                    allUnset = false;
                }
            }
        }
        allUnset = true;
        for (var i = this.w - 1; i >= 0 && allUnset; i--) {
            for (var j = 0; j < this.h && allUnset; j++) {
                if (this.mask[i][j]) {
                    r = i;
                    allUnset = false;
                }
            }
        }
        allUnset = true;
        for (var j = 0; j < this.h && allUnset; j++) {
            for (var i = 0; i < this.w && allUnset; i++) {
                if (this.mask[i][j]) {
                    t = j;
                    allUnset = false;
                }
            }
        }
        allUnset = true;
        for (var j = this.h - 1; j >= 0 && allUnset; j--) {
            for (var i = 0; i < this.w && allUnset; i++) {
                if (this.mask[i][j]) {
                    b = j;
                    allUnset = false;
                }
            }
        }
        // console.log(`${l},${t},${r},${b}`);
        return Rectangle.fromLTRB(l, t, r, b);
    };
    Area.prototype.getMask = function (x, y) {
        x = ~~x;
        y = ~~y;
        if (x >= 0 && x < this.w && y >= 0 && y < this.h)
            return this.mask[x][y];
        else
            return false;
    };
    Area.prototype.setMask = function (x, y, val) {
        this.mask[x][y] = val;
    };
    /**
     * Split the area into multiple areas with Manhattan distance voronoi
     *
     */
    Area.prototype.splitUpWithVoronoi = function (pts) {
        var areas = [];
        for (var i = 0; i < pts.length; i++)
            areas.push(new Area(this.w, this.h));
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++) {
                // determine the closest point for this tile
                var minDist = Number.MAX_VALUE;
                var minPt = 0;
                for (var p = 0; p < pts.length; p++) {
                    var pt = pts[p];
                    var dist = Math.abs(pt.y - j) + Math.abs(pt.x - i);
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
    };
    /**
     * For each tile calculate the distance to an unset tile in 8 directions
     */
    Area.prototype.getDistanceCells = function () {
        var cells = new Array(this.w);
        for (var i = 0; i < this.w; i++) {
            cells[i] = new Array(this.h);
            for (var j = 0; j < this.h; j++) {
                cells[i][j] = new Cell();
                cells[i][j].mask = this.mask[i][j];
            }
        }
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++) {
                var c = cells[i][j];
                if (this.mask[i][j]) {
                    // left
                    if (i - 1 >= 0) {
                        if (cells[i - 1][j].l > 0) {
                            cells[i][j].l = cells[i - 1][j].l + 1;
                        }
                        else {
                            for (var k = i - 1; k >= 0; k--) {
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
                        }
                        else {
                            for (var k = j - 1; k >= 0; k--) {
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
                        }
                        else {
                            for (var k = i; k < this.w; k++) {
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
                        }
                        else {
                            for (var k = j + 1; k < this.h; k++) {
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
                        }
                        else {
                            if (i - 1 > j - 1) {
                                var c_1 = 1;
                                for (var k = i - 1; k >= 0; k--) {
                                    if (!this.mask[i - c_1][j - c_1]) {
                                        cells[i][j].lt = i - k;
                                        break;
                                    }
                                    c_1++;
                                }
                            }
                            else {
                                var c_2 = 1;
                                for (var k = j - 1; k >= 0; k--) {
                                    if (!this.mask[i - c_2][j - c_2]) {
                                        cells[i][j].lt = j - k;
                                        break;
                                    }
                                    c_2++;
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
                        }
                        else {
                            if (this.w - i + 1 > j - 1) {
                                var c_3 = 1;
                                for (var k = i + 1; k < this.w; k++) {
                                    if (!this.mask[i + c_3][j - c_3]) {
                                        cells[i][j].rt = k - i;
                                        break;
                                    }
                                    c_3++;
                                }
                            }
                            else {
                                var c_4 = 1;
                                for (var k = j - 1; k >= 0; k--) {
                                    if (!this.mask[i + c_4][j - c_4]) {
                                        cells[i][j].rt = j - k;
                                        break;
                                    }
                                    c_4++;
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
                        }
                        else {
                            if (i - 1 > this.h - j + 1) {
                                var c_5 = 1;
                                for (var k = i - 1; k >= 0; k--) {
                                    if (!this.mask[i - c_5][j + c_5]) {
                                        cells[i][j].lb = i - k;
                                        break;
                                    }
                                    c_5++;
                                }
                            }
                            else {
                                var c_6 = 1;
                                for (var k = j + 1; k < this.h; k++) {
                                    if (!this.mask[i - c_6][j + c_6]) {
                                        cells[i][j].lb = k - j;
                                        break;
                                    }
                                    c_6++;
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
                        }
                        else {
                            if (this.w - i + 1 > this.h - j + 1) {
                                var c_7 = 1;
                                for (var k = i + 1; k < this.w; k++) {
                                    if (!this.mask[i + c_7][j + c_7]) {
                                        cells[i][j].rb = k - i;
                                        break;
                                    }
                                    c_7++;
                                }
                            }
                            else {
                                var c_8 = 1;
                                for (var k = j + 1; k < this.h; k++) {
                                    if (!this.mask[i + c_8][j + c_8]) {
                                        cells[i][j].rb = k - j;
                                        break;
                                    }
                                    c_8++;
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
    };
    Area.prototype.getLargestRectangle = function () {
        return Algorithm.MaximumRectangle.MaximalRectangle.main(this.w, this.h, this.mask);
    };
    return Area;
})();
var Cell = (function () {
    function Cell() {
        this.mask = false;
        this.l = 0;
        this.t = 0;
        this.r = 0;
        this.b = 0;
        this.lt = 0;
        this.rt = 0;
        this.lb = 0;
        this.rb = 0;
    }
    return Cell;
})();
var Rectangle = (function () {
    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.x = ~~x;
        this.y = ~~y;
        this.width = ~~this.width;
        this.height = ~~this.height;
    }
    Rectangle.prototype.move = function (dx, dy) {
        this.x += dx;
        this.y += dy;
    };
    Rectangle.prototype.expand = function (paddingLeft, paddingTop, paddingRight, paddingBottom) {
        this.x -= paddingLeft;
        this.y -= paddingTop;
        this.width += paddingLeft + paddingRight;
        this.height += paddingTop + paddingBottom;
    };
    Rectangle.fromLTRB = function (l, t, r, b) {
        var rect = new Rectangle(l, t, r - l + 1, b - t + 1);
        return rect;
    };
    return Rectangle;
})();
var Algorithm;
(function (Algorithm) {
    var MaximumRectangle;
    (function (MaximumRectangle) {
        var Cell = (function () {
            function Cell(col, row) {
                this.col = col;
                this.row = row;
            }
            return Cell;
        })();
        var Cache = (function () {
            function Cache(size) {
                this.aggregateHeights = [];
                for (var i = 0; i <= size; i++) {
                    this.aggregateHeights.push(0);
                }
            }
            Cache.prototype.get = function (col) {
                return this.aggregateHeights[col];
            };
            Cache.prototype.aggregate = function (cells, nrColumns, row) {
                for (var col = 0; col < nrColumns; col++) {
                    var element = cells[col][row];
                    if (!element) {
                        this.aggregateHeights[col] = 0;
                    }
                    else {
                        this.aggregateHeights[col] = this.aggregateHeights[col] + 1;
                    }
                }
            };
            return Cache;
        })();
        /**
         * @see http://stackoverflow.com/a/20039017/1028367
         * @see http://www.drdobbs.com/database/the-maximal-rectangle-problem/184410529
         */
        var MaximalRectangle = (function () {
            function MaximalRectangle() {
            }
            MaximalRectangle.main = function (numColumns, numRows, cells) {
                var bestArea = 0;
                var bestLowerLeftCorner = new Cell(0, 0);
                var bestUpperRightCorner = new Cell(-1, -1);
                var stack = [];
                var rectangleHeightCache = new Cache(numColumns);
                for (var row = 0; row < numRows; row++) {
                    rectangleHeightCache.aggregate(cells, numColumns, row);
                    for (var col = 0, currentRectHeight = 0; col <= numColumns; col++) {
                        var aggregateRectHeight = rectangleHeightCache.get(col);
                        if (aggregateRectHeight > currentRectHeight) {
                            stack.push(new Cell(col, currentRectHeight));
                            currentRectHeight = aggregateRectHeight;
                        }
                        else if (aggregateRectHeight < currentRectHeight) {
                            var rectStartCell = void 0;
                            do {
                                rectStartCell = stack.pop();
                                var rectWidth = col - rectStartCell.col;
                                var area = currentRectHeight * rectWidth;
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
            };
            return MaximalRectangle;
        })();
        MaximumRectangle.MaximalRectangle = MaximalRectangle;
    })(MaximumRectangle = Algorithm.MaximumRectangle || (Algorithm.MaximumRectangle = {}));
})(Algorithm || (Algorithm = {}));
var DataStructs;
(function (DataStructs) {
    var Map = (function () {
        function Map() {
            this.obj = {};
        }
        Map.prototype.containsKey = function (key) {
            return this.obj.hasOwnProperty(key) && typeof this.obj[key] !== "undefined";
        };
        Map.prototype.getKeys = function () {
            var keys = [];
            for (var el in this.obj) {
                if (this.obj.hasOwnProperty(el))
                    keys.push(el);
            }
            return keys;
        };
        Map.prototype.get = function (key) {
            var o = this.obj[key];
            if (typeof o === "undefined")
                return null;
            else
                return o;
        };
        Map.prototype.put = function (key, value) {
            this.obj[key] = value;
        };
        Map.prototype.remove = function (key) {
            delete this.obj[key];
        };
        Map.prototype.clone = function () {
            var m = new Map();
            m.obj = {};
            for (var p in this.obj) {
                m.obj[p] = this.obj[p];
            }
            return m;
        };
        return Map;
    })();
    DataStructs.Map = Map;
    var Heap = (function () {
        function Heap() {
            this.array = [];
            this.keyMap = new Map();
        }
        Heap.prototype.add = function (obj) {
            if (this.keyMap.containsKey(obj.getKey())) {
                throw new Error("Item with key " + obj.getKey() + " already exists in the heap");
            }
            this.array.push(obj);
            this.keyMap.put(obj.getKey(), this.array.length - 1);
            this.checkParentRequirement(this.array.length - 1);
        };
        Heap.prototype.replaceAt = function (idx, newobj) {
            this.array[idx] = newobj;
            this.keyMap.put(newobj.getKey(), idx);
            this.checkParentRequirement(idx);
            this.checkChildrenRequirement(idx);
        };
        Heap.prototype.shift = function () {
            return this.removeAt(0);
        };
        Heap.prototype.remove = function (obj) {
            var idx = this.keyMap.get(obj.getKey());
            if (idx == -1)
                return;
            this.removeAt(idx);
        };
        Heap.prototype.removeWhere = function (predicate) {
            var itemsToRemove = [];
            for (var i = this.array.length - 1; i >= 0; i--) {
                if (predicate(this.array[i])) {
                    itemsToRemove.push(this.array[i]);
                }
            }
            for (var _i = 0; _i < itemsToRemove.length; _i++) {
                var el = itemsToRemove[_i];
                this.remove(el);
            }
            for (var _a = 0, _b = this.array; _a < _b.length; _a++) {
                var el = _b[_a];
                if (predicate(el)) {
                    console.log("Idx of element not removed: " + this.keyMap.get(el.getKey()));
                    throw new Error("element not removed: " + el.getKey());
                }
            }
        };
        Heap.prototype.removeAt = function (idx) {
            var obj = this.array[idx];
            this.keyMap.remove(obj.getKey());
            var isLastElement = idx == this.array.length - 1;
            if (this.array.length > 0) {
                var newobj = this.array.pop();
                if (!isLastElement && this.array.length > 0)
                    this.replaceAt(idx, newobj);
            }
            return obj;
        };
        Heap.prototype.foreach = function (func) {
            var arr = this.array.sort(function (e, e2) { return e.compareTo(e2); });
            for (var _i = 0; _i < arr.length; _i++) {
                var el = arr[_i];
                func(el);
            }
        };
        Heap.prototype.peek = function () {
            return this.array[0];
        };
        Heap.prototype.contains = function (key) {
            return this.keyMap.containsKey(key);
        };
        Heap.prototype.at = function (key) {
            var obj = this.keyMap.get(key);
            if (typeof obj === "undefined")
                return null;
            else
                return this.array[obj];
        };
        Heap.prototype.size = function () {
            return this.array.length;
        };
        Heap.prototype.checkHeapRequirement = function (item) {
            var idx = this.keyMap.get(item.getKey());
            if (idx != null) {
                this.checkParentRequirement(idx);
                this.checkChildrenRequirement(idx);
            }
        };
        Heap.prototype.checkChildrenRequirement = function (idx) {
            var stop = false;
            while (!stop) {
                var left = this.getLeftChildIndex(idx);
                var right = left == -1 ? -1 : left + 1;
                if (left == -1)
                    return;
                if (right >= this.size())
                    right = -1;
                var minIdx = void 0;
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
        };
        Heap.prototype.checkParentRequirement = function (idx) {
            var curIdx = idx;
            var parentIdx = Heap.getParentIndex(curIdx);
            while (parentIdx >= 0 && this.array[parentIdx].compareTo(this.array[curIdx]) > 0) {
                this.swap(curIdx, parentIdx);
                curIdx = parentIdx;
                parentIdx = Heap.getParentIndex(curIdx);
            }
        };
        Heap.prototype.dump = function () {
            if (this.size() == 0)
                return;
            var idx = 0;
            var leftIdx = this.getLeftChildIndex(idx);
            var rightIdx = leftIdx + 1;
            console.log(this.array);
            console.log("--- keymap ---");
            console.log(this.keyMap);
        };
        Heap.prototype.swap = function (i, j) {
            this.keyMap.put(this.array[i].getKey(), j);
            this.keyMap.put(this.array[j].getKey(), i);
            var tmp = this.array[i];
            this.array[i] = this.array[j];
            this.array[j] = tmp;
        };
        Heap.prototype.getLeftChildIndex = function (curIdx) {
            var idx = ((curIdx + 1) * 2) - 1;
            if (idx >= this.array.length)
                return -1;
            else
                return idx;
        };
        Heap.getParentIndex = function (curIdx) {
            if (curIdx == 0)
                return -1;
            return Math.floor((curIdx + 1) / 2) - 1;
        };
        Heap.prototype.clone = function () {
            var h = new Heap();
            h.array = this.array.slice(0);
            h.keyMap = this.keyMap.clone();
            return h;
        };
        return Heap;
    })();
    var PriorityQueue = (function () {
        function PriorityQueue() {
            this.heap = new Heap();
        }
        PriorityQueue.prototype.enqueue = function (obj) {
            this.heap.add(obj);
        };
        PriorityQueue.prototype.peek = function () {
            return this.heap.peek();
        };
        PriorityQueue.prototype.updatePriority = function (key) {
            this.heap.checkHeapRequirement(key);
        };
        PriorityQueue.prototype.get = function (key) {
            return this.heap.at(key);
        };
        Object.defineProperty(PriorityQueue.prototype, "size", {
            get: function () {
                return this.heap.size();
            },
            enumerable: true,
            configurable: true
        });
        PriorityQueue.prototype.dequeue = function () {
            return this.heap.shift();
        };
        PriorityQueue.prototype.dump = function () {
            this.heap.dump();
        };
        PriorityQueue.prototype.contains = function (key) {
            return this.heap.contains(key);
        };
        PriorityQueue.prototype.removeWhere = function (predicate) {
            this.heap.removeWhere(predicate);
        };
        PriorityQueue.prototype.foreach = function (func) {
            this.heap.foreach(func);
        };
        PriorityQueue.prototype.clone = function () {
            var p = new PriorityQueue();
            p.heap = this.heap.clone();
            return p;
        };
        return PriorityQueue;
    })();
    DataStructs.PriorityQueue = PriorityQueue;
})(DataStructs || (DataStructs = {}));
var Sampling;
(function (Sampling) {
    // the size in pixels of the radius of the sample
    var SAMPLE_CIRCLE_RADIUS = 3;
    // Implementation based on http://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
    var PoissonDisc = (function () {
        function PoissonDisc(width, height, minDistance, nrSamplingAttempts, rnd, canAddSample) {
            this.rnd = rnd;
            this.samples = [];
            this.backgroundGrid = [];
            this.activeList = [];
            this.deepestSample = null;
            this.drawLinks = true;
            this.drawLinkColor = "white";
            this.width = width;
            this.height = height;
            this.minDistance = minDistance;
            this.nrSamplingAttempts = nrSamplingAttempts;
            this.canAddSample = canAddSample;
            // step 0: initialize a n-dimensional background grid
            this.initBackgroundGrid();
        }
        Object.defineProperty(PoissonDisc.prototype, "isDone", {
            get: function () { return this._isDone; },
            enumerable: true,
            configurable: true
        });
        PoissonDisc.prototype.getDeepestSample = function () {
            return this.deepestSample;
        };
        /**
         * Initializes the background grid and determines the cell size and how many rows & cols the grid has
         */
        PoissonDisc.prototype.initBackgroundGrid = function () {
            // ensure that there will only be at most 1 sample per cell in the background grid
            this.cellSize = this.minDistance; // / Math.sqrt(2));
            // determine the nr of cols & rows in the background grid
            this.nrCols = Math.ceil(this.width / this.cellSize);
            this.nrRows = Math.ceil(this.height / this.cellSize);
            for (var i = 0; i < this.nrCols; i++) {
                this.backgroundGrid[i] = [];
                for (var j = 0; j < this.nrRows; j++) {
                    this.backgroundGrid[i][j] = null;
                }
            }
        };
        PoissonDisc.prototype.addInitialSample = function (x, y) {
            var initSample = new Sample(x, y);
            this.addSample(initSample);
            this.deepestSample = initSample;
        };
        /**
         * Adds a valid sample to the various constructs of the algorithm
         */
        PoissonDisc.prototype.addSample = function (s) {
            var xIdx = Math.floor(s.x / this.width * this.nrCols);
            var yIdx = Math.floor(s.y / this.height * this.nrRows);
            this.backgroundGrid[xIdx][yIdx] = s;
            this.activeList.push(s);
            this.samples.push(s);
            //s.drawTo(Main.Canvases.ctxOverlay, true);
        };
        /**
         * Chooses a sample from the active list and tries to find a random sample between its r and 2r radius
         * that is not too close to other samples, checked by looking nearby samples up in the background grid
         * If no sample could be determined within <nrSamples> then stop looking and return false. Also remove the
         * sample from the active list because it will never have any suitable samples to expand upon.
         *
         * @returns true if a sample was able to be found, otherwise false
         */
        PoissonDisc.prototype.step = function () {
            if (this.activeList.length <= 0) {
                this._isDone = true;
                return true;
            }
            // choose a random index from it
            var idx = Math.floor(this.rnd.next() * this.activeList.length);
            var s = this.activeList[idx];
            // generate up to nrSamples points uniformly from the spherical annullus between radius r and 2r (MIN_DISTANCE and 2 * MIN_DISTANCE)
            // around the chosen sample x_i
            // choose a point by creating a vector to the inner boundary
            // and multiplying it by a random value between [1-2]
            var initvX = this.minDistance;
            var initvY = 0;
            var k = 0;
            var found = false;
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
                var x = s.x + length * vX;
                var y = s.y + length * vY;
                var xIdx = Math.floor(x / this.width * this.nrCols);
                var yIdx = Math.floor(y / this.height * this.nrRows);
                if (x >= 0 && y >= 0 && x < this.width && y < this.height
                    && this.backgroundGrid[xIdx][yIdx] == null
                    && !this.containsSampleInBackgroundGrid(x, y) && this.canAddSample(x, y)) {
                    // adequately far from existing samples
                    var newSample = new Sample(x, y);
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
            }
            return found;
        };
        /**
         * Checks if there is a sample around the x,y sample that's closer than the minimum radius
         * using the background grid
         *
         * @returns true if there is a sample within the minimum radius, otherwise false
         */
        PoissonDisc.prototype.containsSampleInBackgroundGrid = function (x, y) {
            var xIdx = (x / this.width * this.nrCols);
            var yIdx = (y / this.height * this.nrRows);
            // determine the bounding box of the radius
            var lboundX = (x - this.minDistance) / this.width * this.nrCols;
            var lboundY = (y - this.minDistance) / this.height * this.nrRows;
            var uboundX = Math.ceil((x + this.minDistance) / this.width * this.nrCols);
            var uboundY = Math.ceil((y + this.minDistance) / this.height * this.nrRows);
            // make sure i,j falls within bounds
            if (lboundX < 0)
                lboundX = 0;
            if (lboundY < 0)
                lboundY = 0;
            if (uboundX >= this.nrCols)
                uboundX = this.nrCols - 1;
            if (uboundY >= this.nrRows)
                uboundY = this.nrRows - 1;
            for (var i = lboundX; i <= uboundX; i++) {
                for (var j = lboundY; j <= uboundY; j++) {
                    var sample = this.backgroundGrid[Math.floor(i)][Math.floor(j)];
                    // check if the cell contains a sample and if the distance is smaller than the minimum distance
                    if (sample != null &&
                        sample.distanceTo(x, y) < this.minDistance) {
                        return true; // short circuit if you don't need to draw the cells around the given x,y
                    }
                }
            }
            return false;
        };
        return PoissonDisc;
    })();
    Sampling.PoissonDisc = PoissonDisc;
    var Sample = (function () {
        function Sample(x, y) {
            this.previousSample = null;
            this.x = Math.floor(x);
            this.y = Math.floor(y);
            this.depth = 0;
        }
        Sample.prototype.drawTo = function (ctx, isActive) {
            ctx.beginPath();
            if (isActive)
                ctx.fillStyle = "#CCC";
            else
                ctx.fillStyle = "black";
            ctx.arc(this.x, this.y, SAMPLE_CIRCLE_RADIUS, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();
        };
        Sample.prototype.distanceTo = function (x, y) {
            return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
        };
        return Sample;
    })();
    Sampling.Sample = Sample;
    var Random = (function () {
        function Random(seed) {
            if (typeof seed === "undefined")
                seed = ~~(Math.random() * 10000000);
            this.seed = seed;
            this.val = seed;
        }
        Random.prototype.next = function () {
            // this is in no way uniformly distributed, so it's really a bad rng, but it's fast enough
            // and random enough
            var x = Math.sin(this.val++) * 10000;
            return x - Math.floor(x);
        };
        Random.prototype.nextBetween = function (min, max) {
            return min + this.next() * (max - min);
        };
        return Random;
    })();
    Sampling.Random = Random;
})(Sampling || (Sampling = {}));
// -----------------------------------------------------------
var zoom = 1 / 8;
var seed = 123456789;
var settings = new Settings();
var m;
function initialize() {
    var c = document.getElementById("c1");
    var ctx = c.getContext("2d");
    var cx = ~~(TILE_WIDTH * zoom);
    var cy = ~~(TILE_HEIGHT * zoom);
    var w = ~~(c.width / cx);
    var h = ~~(c.height / cy);
    $(".layers").height(c.height);
    var rnd = new Sampling.Random(seed);
    $("#txtSeed").val(rnd.seed + "");
    settings.randomize(rnd, w, h);
    m = new Main(settings, c, w, h, cx, cy, rnd);
    m.run(StepEnum.Done);
}
$("#txtSeed").change(function () {
    seed = $(this).val();
    initialize();
});
$("#tileset").load(function () {
    initialize();
});
$("#txtZoom").change(function () {
    zoom = 1 / $(this).val();
    initialize();
});
function showSteps() {
    var c = document.getElementById("c1");
    var ctx = c.getContext("2d");
    var rnd = new Sampling.Random(seed);
    var cx = ~~(TILE_WIDTH * zoom);
    var cy = ~~(TILE_HEIGHT * zoom);
    var w = ~~(c.width / cx);
    var h = ~~(c.height / cy);
    settings.randomize(rnd, w, h);
    m.rnd = rnd;
    var curStep = StepEnum.Area;
    var func = function () {
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
$("#chkSteps").change(function () {
    if ($(this).prop("checked")) {
        showSteps();
    }
    else {
        initialize();
    }
});
$("#chkToggleLayerDebug").change(function () {
    SHOW_ALL_LAYER_DEBUG = $(this).prop("checked");
    initialize();
});
$("#btnRandom").click(function () {
    seed = ~~(Math.random() * 1000000000);
    initialize();
});
function generateCanvas() {
    var c = document.createElement("canvas");
    var previewC = document.getElementById("c1");
    c.width = previewC.width / zoom;
    c.height = previewC.height / zoom;
    var cx = ~~(TILE_WIDTH);
    var cy = ~~(TILE_HEIGHT);
    var w = ~~(c.width / cx);
    var h = ~~(c.height / cy);
    var rnd = new Sampling.Random(seed);
    var settings = new Settings();
    settings.randomize(rnd, w, h);
    var main = new Main(settings, c, w, h, cx, cy, rnd);
    main.run(StepEnum.Done);
    return c;
}
$("#btnLarge").click(function () {
    var c = generateCanvas();
    $(document.body).append(c);
    $(c).click(function () {
        $(c).detach();
    });
});
$("#btnUploadLargeToImgur").click(function () {
    $("#btnUploadLargeToImgur").prop("disabled", true);
    var c = generateCanvas();
    var png = new exports.PngCreator();
    png.setImage(c);
    png.uploadToImgur("Procedural castle - seed " + seed, "", function (success, id) {
        if (success)
            window.open("http://www.imgur.com/" + id);
        else
            alert("Upload to imgur failed");
        $("#btnUploadLargeToImgur").prop("disabled", false);
    });
});
$("#btnCreateGif").click(function () {
    $("#btnCreateGif").prop("disabled", true);
    var c = document.createElement("canvas");
    var previewC = document.getElementById("c1");
    c.width = previewC.width;
    c.height = previewC.height;
    var ctx = c.getContext("2d");
    var rnd = new Sampling.Random(seed);
    var cx = ~~(TILE_WIDTH * zoom);
    var cy = ~~(TILE_HEIGHT * zoom);
    var w = ~~(c.width / cx);
    var h = ~~(c.height / cy);
    settings.randomize(rnd, w, h);
    var gif = new exports.GIFCreator();
    var main = new Main(settings, c, w, h, cx, cy, rnd);
    main.rnd = rnd;
    var curStep = StepEnum.Area;
    var onDone = function () {
        gif.render(function () {
            gif.uploadToImgur("Procedural castle - seed " + seed, "", function (success, id) {
                if (success)
                    window.open("http://www.imgur.com/" + id);
                else
                    alert("Upload to imgur failed");
                $("#btnCreateGif").prop("disabled", false);
            });
        });
    };
    var func = function () {
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
//# sourceMappingURL=main.js.map
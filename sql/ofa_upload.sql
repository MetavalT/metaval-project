-- Lock everything inside a safe database transaction block
BEGIN;

-- 1. Wipe out the old layout to prevent any structural legacy column collision noise
DROP TABLE IF EXISTS ofa_upload CASCADE;

-- 2. Construct the pristine multi-column enterprise data matrix sheet
CREATE TABLE ofa_upload (
    -- Metadata Internal Dashboard Audit Tracking Columns (Preserved safely at the starting index)
    "TagNo" VARCHAR(255) PRIMARY KEY,                      -- A1
    
    -- pristine case-preserved engineering column slots matching your layout requirements
                              
    "Item Name" VARCHAR(255),                             -- B1
    "Quantity" NUMERIC DEFAULT 0,                         -- C1
    "Project" VARCHAR(255),                               -- D1
    "Plate MATERIAL" VARCHAR(255),                        -- E1
    "Flange MATERIAL" VARCHAR(255),                       -- F1
    "Flange Type" VARCHAR(255),                           -- G1
    "Piece Type" VARCHAR(255),                            -- H1
    "Weld Type" VARCHAR(255),                             -- I1
    "Holder Type" VARCHAR(255),                           -- J1
    "Line_Size" VARCHAR(255),                             -- K1
    "Size in NPS OR DN" VARCHAR(255),                     -- L1
    "Flange Schedule" VARCHAR(255),                       -- M1
    "Pipe Wall Thk" VARCHAR(255),                         -- N1
    "Rating" VARCHAR(255),                                -- O1
    "RJ HOLDER MATERIAL" VARCHAR(255),                    -- P1
    "Drain/Vent" VARCHAR(255),                            -- Q1
    "Smooth Finish" VARCHAR(255),                         -- R1
    "Serration" VARCHAR(255),                             -- S1
    "Stellite" VARCHAR(255),                              -- T1
    "Fluid/Service_Name" VARCHAR(255),                    -- U1
    "Service Discription" VARCHAR(255),                   -- V1
    "Service Type" VARCHAR(255),                          -- W1
    "Calculation Standard" VARCHAR(255),                  -- X1
    "Flow Element Type" VARCHAR(255),                     -- Y1
    "Flow Rate Unit" VARCHAR(255),                        -- Z1
    "Flow Rate Minimum" NUMERIC DEFAULT 0,                 -- AA1
    "Flow Rate Maximum" NUMERIC DEFAULT 0,                 -- AB1
    "Flow Rate Normal" NUMERIC DEFAULT 0,                  -- AC1
    "Flow Rate at FullScale" NUMERIC DEFAULT 0,            -- AD1
    "Tapping" VARCHAR(255),                               -- AE1
    "Multi Hole" VARCHAR(255),                            -- AF1
    "Pipe Material" VARCHAR(255),                         -- AG1
    "Pressure Unit" VARCHAR(255),                         -- AH1
    "Temp Unit" VARCHAR(255),                             -- AI1
    "Viscosity Unit" VARCHAR(255),                        -- AJ1
    "Density Unit" VARCHAR(255),                          -- AK1
    "Density_Calc_Method" VARCHAR(255),                   -- AL1
    "MolecularWeight_Customer" NUMERIC DEFAULT 0,         -- AM1
    "Compressibility_atFlow_Customer" NUMERIC DEFAULT 0,  -- AN1
    "Compressibility_atBase_Customer" NUMERIC DEFAULT 0,  -- AO1
    "Gas Name" VARCHAR(255),                              -- AP1
    "Base Pressure" NUMERIC DEFAULT 0,                    -- AQ1
    "Upstream Pressure" NUMERIC DEFAULT 0,                -- AR1
    "Base_Temperature" NUMERIC DEFAULT 0,                 -- AS1
    "Operating_Temperature" NUMERIC DEFAULT 0,            -- AT1
    "Vapour_Pressure" NUMERIC DEFAULT 0,                  -- AU1
    "Density_at_Base_Customer" NUMERIC DEFAULT 0,         -- AV1
    "Density_at_Flow_Customer" NUMERIC DEFAULT 0,         -- AW1
    "Viscosity_Customer" NUMERIC DEFAULT 0,               -- AX1
    "IsentropicExponent_Customer" NUMERIC DEFAULT 0,      -- AY1
    "DP Unit" VARCHAR(255),                               -- AZ1
    "DP at Full Scale" NUMERIC DEFAULT 0,                 -- BA1
    "Design Pressure Discription" VARCHAR(255),           -- BB1
    "Design Pressure" NUMERIC DEFAULT 0,                  -- BC1
    "Design Temp Discription" VARCHAR(255),               -- BD1
    "Design Temp" NUMERIC DEFAULT 0,                      -- BE1
    "Flange Standard" VARCHAR(255),                       -- BF1
    "Plate Thk Customer" NUMERIC DEFAULT 0,               -- BG1
    "Spare Plate Required" VARCHAR(255),                  -- BH1
    "Stud/Nut" VARCHAR(255),                              -- BI1
    "Gasket" VARCHAR(255),                                -- BJ1
    "JackBolt" VARCHAR(255),                              -- BK1
    "Packing_Cost_Manual" NUMERIC DEFAULT 0,              -- BL1
    "Accessories" VARCHAR(255),                           -- BM1
    "Accessories_Amt" NUMERIC DEFAULT 0,                  -- BN1
    "IBR" VARCHAR(255),                                   -- BO1
    "IBR_Amt_Manual" NUMERIC DEFAULT 0,                   -- BP1
    "Nace" VARCHAR(255),                                  -- BQ1
    "Nace_Type" VARCHAR(255),                             -- BR1
    "Nace_Percent" NUMERIC DEFAULT 0,                     -- BS1
    "Calibration" VARCHAR(255),                           -- BT1
    "CalibrationAmt_Manual" NUMERIC DEFAULT 0,            -- BU1
    "Freight_Required" VARCHAR(255),                      -- BV1
    "Freight_Amt_Manual" NUMERIC DEFAULT 0,               -- BW1
    "Special_Requirement" TEXT,                           -- BX1
    "Special_Requirement_Amt" NUMERIC DEFAULT 0,          -- BY1
    "OFA Tap Orientation" VARCHAR(255),                   -- BZ1
    "FNA Tap Orientation" VARCHAR(255),                   -- CA1
    "Venturi Tap Orientation" VARCHAR(255),               -- CB1
    "Plug_Material" VARCHAR(255),                         -- CC1
    "Pressure_Tap_Angle" NUMERIC DEFAULT 0,               -- CD1
    "JackBold_Position" VARCHAR(255),                     -- CE1
    "ItemCode_Heading" VARCHAR(255),                      -- CF1
    "ItemCode" VARCHAR(255),                              -- CG1
    "TestSchedule" VARCHAR(255),                          -- CH1
    "FNA Pipe Machining Required" VARCHAR(255),           -- CI1
    "FNA Pipe Machined Cost" NUMERIC DEFAULT 0,           -- CJ1
    "FNA Total Assy. Length" NUMERIC DEFAULT 0,           -- CK1
    "FNA Upstream Length" NUMERIC DEFAULT 0,              -- CL1
    "FNA Pipe Length Show to Customer" NUMERIC DEFAULT 0, -- CM1
    "FNA Pipe Length Customer" NUMERIC DEFAULT 0,          -- CN1
    "Chamfer" VARCHAR(255),                               -- CO1
    "ØD1" VARCHAR(255),                                   -- CP1 (Double quotes preserve the explicit diameter symbol!)
    "Adapter Rating" VARCHAR(255),                        -- CQ1
    "Flow Nozzle Holding Ring Material" VARCHAR(255),     -- CR1
    "Flow Nozzle Material" VARCHAR(255),                  -- CT1 (Note: Maps to CT1 cell parameter boundary tracking)
    "Nipple Material" VARCHAR(255),                       -- CT1
    "Nipple Size" VARCHAR(255),                           -- CU1
    "Nipple Schedule" VARCHAR(255),                       -- CV1
    "Nipple Quantity" NUMERIC DEFAULT 0,                  -- CW1
    "Venturi Throat Material" VARCHAR(255),               -- CX1
    "Cyllinder Material" VARCHAR(255),                    -- CV1
    "Cone Material" VARCHAR(255),                         -- CZ1
    "Piezometer RIng Material" VARCHAR(255),              -- DA1
    "End Flange Standard" VARCHAR(255),                   -- DB1
    "End Flange Type" VARCHAR(255),                       -- DC1
    "End Flange Material" VARCHAR(255),                   -- DD1
    "End Flange Rating" VARCHAR(255),                     -- DE1
    "No of End Flange" NUMERIC DEFAULT 0,                 -- DF1
    "Adapter Material" VARCHAR(255),                      -- DG1
    "No. of Tapping 1" NUMERIC DEFAULT 0,                 -- DH1
    "Tap Size 1" VARCHAR(255),                            -- DI1
    "No. of Tapping 2" NUMERIC DEFAULT 0,                 -- DJ1
    "Tap Size 2" VARCHAR(255),                            -- DK1
    "Companion Flange Required" VARCHAR(255),             -- DL1
    "Tapping Flange" VARCHAR(255),                        -- DM1
    "Tapping Flange Size" VARCHAR(255),                   -- DN1
    "PilotTube Type" VARCHAR(255),                        -- DO1
    "Duct Inside Width" NUMERIC DEFAULT 0,                -- DP1
    "Duct Outside Width" NUMERIC DEFAULT 0,               -- DQ1
    "Duct Inside Height" NUMERIC DEFAULT 0,               -- DR1
    "Duct Outside Height" NUMERIC DEFAULT 0,              -- DS1
    "PitotTube Probe Material" VARCHAR(255),              -- DT1
    "Pitot Tube Type" VARCHAR(255),                       -- DU1
    "Pitot End Support" VARCHAR(255),                     -- DV1
    "Clamping Condition" VARCHAR(255),                    -- DW1
    "Pitot Tube End Connection Material" VARCHAR(255),    -- DX1
    "Pitot Tube Sleeve Material" VARCHAR(255),             -- DY1
   
   -- Column DZ1: Dispatched smoothly to the absolute back of the record tracking sequence
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP -- DZ1
);

-- Commit transaction safely
COMMIT;
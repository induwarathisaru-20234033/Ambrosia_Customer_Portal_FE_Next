"use client";

import axios from "axios";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Ellipse, Group, Layer, Rect, Stage, Text } from "react-konva";
import { useReservationFlow } from "../contexts/ReservationFlowContext";
import {
  API_BASE_URL,
  CANVAS_PADDING,
  type ApiResponse,
  type FloorMapData,
  type FloorShape,
  type TableStatus,
  formatDateLabel,
  formatTableLabel,
  getCanvasMetrics,
  getTableStatus,
} from "./flow-types";

const statusColors = {
  available: "#f5c27c",
  selected: "#f48f95",
  unavailable: "#8794a4",
};

function useElementWidth(containerRef: RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const current = containerRef.current;
    if (!current) {
      return undefined;
    }

    const updateWidth = () => {
      setWidth(current.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(current);

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  return width;
}

type TableNodeProps = {
  shape: FloorShape;
  status: TableStatus;
  originX: number;
  originY: number;
  onSelect: (tableId: number) => void;
};

function TableNode({
  shape,
  status,
  originX,
  originY,
  onSelect,
}: Readonly<TableNodeProps>) {
  const isUnavailable = status === "unavailable";
  const fill = statusColors[status] ?? shape.fill;
  const stroke = status === "selected" ? "#3a2715" : "rgba(58,39,21,0.18)";
  const strokeWidth = status === "selected" ? 4 : 1;
  let shapeElement;

  if (shape.type === 3) {
    shapeElement = (
      <Rect
        x={-shape.width / 2}
        y={-shape.height / 2}
        width={shape.width}
        height={shape.height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={24}
        shadowBlur={status === "selected" ? 18 : 0}
        shadowColor="#3a2715"
        shadowOpacity={0.15}
      />
    );
  } else if (shape.type === 2) {
    shapeElement = (
      <Rect
        x={-shape.width / 2}
        y={-shape.height / 2}
        width={shape.width}
        height={shape.height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={Math.min(shape.width, shape.height) / 2.8}
        shadowBlur={status === "selected" ? 18 : 0}
        shadowColor="#3a2715"
        shadowOpacity={0.15}
      />
    );
  } else {
    shapeElement = (
      <Ellipse
        x={0}
        y={0}
        radiusX={shape.width / 2}
        radiusY={shape.height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        shadowBlur={status === "selected" ? 18 : 0}
        shadowColor="#3a2715"
        shadowOpacity={0.15}
      />
    );
  }

  return (
    <Group
      x={shape.x + shape.width / 2 + originX}
      y={shape.y + shape.height / 2 + originY}
      rotation={shape.rotation}
      onClick={() => {
        if (!isUnavailable) {
          onSelect(shape.assignedTableId);
        }
      }}
      opacity={isUnavailable ? 0.95 : 1}
    >
      {shapeElement}
      <Text
        x={-36}
        y={-10}
        width={72}
        align="center"
        text={formatTableLabel(shape)}
        fontSize={22}
        fontStyle="700"
        fill="#1f1711"
      />
    </Group>
  );
}

export default function TableSelectionStep() {
  const { draft, nextStep, previousStep, setSelectedTable } =
    useReservationFlow();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialSelectedTableIdRef = useRef(draft.selectedTableId);
  const containerWidth = useElementWidth(containerRef);

  const [shapes, setShapes] = useState<FloorShape[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadFloorMap() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data } = await axios.get<ApiResponse<FloorMapData>>(
          `${API_BASE_URL}/Tables/floor-map`,
        );

        if (!isCancelled) {
          const nextShapes = data.data?.shapes ?? [];
          setShapes(nextShapes);

          const currentSelection = nextShapes.find(
            (shape) =>
              shape.assignedTableId === initialSelectedTableIdRef.current &&
              getTableStatus(shape, initialSelectedTableIdRef.current) !==
                "unavailable",
          );

          if (currentSelection?.assignedTable) {
            setSelectedTable(
              currentSelection.assignedTableId,
              currentSelection.assignedTable,
            );
          } else {
            const firstAvailable = nextShapes.find(
              (shape) => getTableStatus(shape, null) === "available",
            );

            setSelectedTable(
              firstAvailable?.assignedTableId ?? null,
              firstAvailable?.assignedTable ?? null,
            );
          }
        }
      } catch (error) {
        console.error("Failed to load floor map", error);
        if (!isCancelled) {
          setShapes([]);
          setErrorMessage("Could not load the floor map.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFloorMap();

    return () => {
      isCancelled = true;
    };
  }, [setSelectedTable]);

  const metrics = useMemo(() => getCanvasMetrics(shapes), [shapes]);
  const stageWidth = containerWidth > 0 ? containerWidth : 960;
  const stageScale = stageWidth / metrics.width;
  const stageHeight = Math.max(metrics.height * stageScale, 320);
  const originX = CANVAS_PADDING - metrics.minX;
  const originY = CANVAS_PADDING - metrics.minY;

  return (
    <>
      <section className="mt-14 w-full rounded-[34px] border border-white/70 bg-white/82 px-5 py-8 shadow-[0_28px_70px_rgba(82,58,21,0.12)] backdrop-blur sm:px-8 md:px-10 lg:px-12 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#fff8eb] px-5 py-4 text-sm text-stone-600 shadow-[0_10px_24px_rgba(82,58,21,0.06)]">
          <span>
            <strong className="text-stone-900">Guests:</strong>{" "}
            {draft.guestCount}
          </span>
          <span>
            <strong className="text-stone-900">Date:</strong>{" "}
            {formatDateLabel(draft.selectedDate)}
          </span>
          <span>
            <strong className="text-stone-900">Time:</strong>{" "}
            {draft.selectedTimeLabel}
          </span>
        </div>

        <div
          ref={containerRef}
          className="mt-8 overflow-hidden rounded-[30px] border border-[#efe6d8] bg-white/90 shadow-[0_18px_50px_rgba(84,58,21,0.12)]"
        >
          {isLoading ? (
            <div className="flex min-h-88 items-center justify-center text-sm font-medium text-stone-500">
              Loading floor map...
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="flex min-h-88 items-center justify-center text-sm font-medium text-red-500">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading && !errorMessage ? (
            <Stage
              width={stageWidth}
              height={stageHeight}
              className="bg-transparent"
            >
              <Layer scaleX={stageScale} scaleY={stageScale}>
                {shapes.map((shape) => {
                  const status = getTableStatus(shape, draft.selectedTableId);

                  return (
                    <TableNode
                      key={`${shape.assignedTableId}-${shape.x}-${shape.y}`}
                      shape={shape}
                      status={status}
                      originX={originX}
                      originY={originY}
                      onSelect={(tableId) => {
                        const selected = shapes.find(
                          (candidate) => candidate.assignedTableId === tableId,
                        );

                        setSelectedTable(
                          tableId,
                          selected?.assignedTable ?? null,
                        );
                      }}
                    />
                  );
                })}
              </Layer>
            </Stage>
          ) : null}
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl items-center justify-center rounded-full bg-[#d7d2ca] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 shadow-[0_12px_22px_rgba(82,58,21,0.08)]">
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#f5c27c]" />
              <span>Available</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#f48f95]" />
              <span>Selected</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#8794a4]" />
              <span>Unavailable</span>
            </span>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-[18px] border-2 border-[#b87d7f] bg-[#e6a0a3] px-6 py-5 text-center text-stone-950 shadow-[0_16px_28px_rgba(184,125,127,0.2)]">
          <h2
            className="text-2xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Current Selection
          </h2>
          {draft.selectedTable ? (
            <ul className="mt-3 space-y-1 text-sm font-medium">
              <li>{draft.selectedTable.tableName}</li>
              <li>{draft.selectedTable.capacity} Seats</li>
              <li>Available</li>
            </ul>
          ) : (
            <p className="mt-3 text-sm font-medium">
              Select an available table to continue.
            </p>
          )}
        </div>
      </section>

      <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={previousStep}
          className="min-w-56 rounded-2xl bg-[#d8d1cb] px-8 py-3 text-center text-sm font-semibold text-stone-700 shadow-[0_14px_24px_rgba(82,58,21,0.12)] transition hover:bg-[#cec5bd]"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!draft.selectedTable}
          onClick={nextStep}
          className="min-w-56 rounded-2xl bg-[#ff7469] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_34px_rgba(255,116,105,0.34)] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#ff655a] disabled:cursor-not-allowed disabled:bg-[#f2b3ae] disabled:shadow-none"
        >
          Continue to Details
        </button>
      </div>
    </>
  );
}

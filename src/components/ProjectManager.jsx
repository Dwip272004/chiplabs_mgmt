// src/components/ProjectManager.jsx
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/**
 * ProjectManager component — integrates with your Supabase schema
 *
 * Expects:
 *  - supabase client passed via props: <ProjectManager supabase={supabase} />
 *  - tables: projects, profiles, project_assignments
 *
 * Behavior (Option A):
 *  - Interns can be assigned to multiple projects
 *  - Drag from pool → project to assign
 *  - Drag from project → pool to unassign
 *  - Drag between projects to reassign (adds new assignment)
 */

const POOL = "interns";

const ProjectManager = ({ supabase }) => {
  if (!supabase) {
    throw new Error("Please provide a Supabase client: <ProjectManager supabase={supabase} />");
  }

  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [assignmentMap, setAssignmentMap] = useState({ [POOL]: [] });
  const [loading, setLoading] = useState(true);
  const realtimeRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: prjs, error: pErr } = await supabase
        .from("projects")
        .select("id, name, priority, deadline, stage")
        .order("id", { ascending: true });
      if (pErr) throw pErr;

      const { data: intns, error: iErr } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name", { ascending: true });
      if (iErr) throw iErr;

      const { data: assigns, error: aErr } = await supabase
        .from("project_assignments")
        .select("id, project_id, intern_id, assigned_at");
      if (aErr) throw aErr;

      const map = { [POOL]: [] };
      prjs.forEach((p) => {
        map[String(p.id)] = [];
      });

      assigns.forEach((a) => {
        const key = String(a.project_id);
        if (!map[key]) map[key] = [];
        map[key].push({
          intern_id: a.intern_id,
          assignment_id: a.id,
          assigned_at: a.assigned_at,
        });
      });

      const assignedSet = new Set(assigns.map((a) => a.intern_id));
      map[POOL] = intns.filter((i) => !assignedSet.has(i.id)).map((i) => i.id);

      setProjects(prjs);
      setInterns(intns);
      setAssignmentMap(map);
    } catch (e) {
      console.error("Failed to load ProjectManager data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  // Setup realtime subscription to project_assignments table
  useEffect(() => {
    if (realtimeRef.current) {
      // cleanup previous
      if (supabase.removeChannel) {
        supabase.removeChannel(realtimeRef.current);
      } else if (realtimeRef.current.unsubscribe) {
        realtimeRef.current.unsubscribe();
      }
    }

    try {
      if (typeof supabase.channel === "function") {
        const chan = supabase
          .channel("public:project_assignments")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "project_assignments" },
            (payload) => {
              const evt = payload.eventType || payload.event || payload.type;
              const rowNew = payload.new ?? payload.record ?? payload.payload?.new;
              const rowOld = payload.old ?? payload.prev ?? payload.payload?.old;

              setAssignmentMap((prev) => {
                const next = { ...prev };

                if (evt === "INSERT") {
                  const key = String(rowNew.project_id);
                  if (!next[key]) next[key] = [];
                  if (!next[key].some((a) => a.assignment_id === rowNew.id)) {
                    next[key] = [
                      ...next[key],
                      { intern_id: rowNew.intern_id, assignment_id: rowNew.id, assigned_at: rowNew.assigned_at },
                    ];
                    next[POOL] = (next[POOL] || []).filter((iid) => iid !== rowNew.intern_id);
                  }
                }

                if (evt === "DELETE") {
                  const key = String(rowOld.project_id);
                  if (next[key]) {
                    next[key] = next[key].filter((a) => a.assignment_id !== rowOld.id);
                  }
                  const stillAssigned = Object.keys(next)
                    .filter((k) => k !== POOL)
                    .some((k) => next[k].some((a) => a.intern_id === rowOld.intern_id));
                  if (!stillAssigned) {
                    next[POOL] = [...(next[POOL] || []), rowOld.intern_id];
                  }
                }

                if (evt === "UPDATE") {
                  // treat as delete old + insert new
                  if (rowOld) {
                    const oldKey = String(rowOld.project_id);
                    if (next[oldKey]) {
                      next[oldKey] = next[oldKey].filter((a) => a.assignment_id !== rowOld.id);
                    }
                  }
                  if (rowNew) {
                    const newKey = String(rowNew.project_id);
                    if (!next[newKey]) next[newKey] = [];
                    if (!next[newKey].some((a) => a.assignment_id === rowNew.id)) {
                      next[newKey] = [
                        ...next[newKey],
                        { intern_id: rowNew.intern_id, assignment_id: rowNew.id, assigned_at: rowNew.assigned_at },
                      ];
                    }
                    next[POOL] = (next[POOL] || []).filter((iid) => iid !== rowNew.intern_id);
                  }
                }

                return next;
              });
            }
          )
          .subscribe();

        realtimeRef.current = chan;
      }
    } catch (e) {
      console.warn("Realtime subscription error", e);
      realtimeRef.current = null;
    }

    return () => {
      if (realtimeRef.current) {
        if (supabase.removeChannel) supabase.removeChannel(realtimeRef.current);
        else if (realtimeRef.current.unsubscribe) realtimeRef.current.unsubscribe();
        realtimeRef.current = null;
      }
    };
  }, [supabase]);

  const insertAssignment = async ({ project_id, intern_id }) => {
    const { data, error } = await supabase
      .from("project_assignments")
      .insert([{ project_id: Number(project_id), intern_id }])
      .select()
      .limit(1);
    if (error) throw error;
    return data?.[0] || null;
  };

  const deleteAssignment = async ({ assignment_id }) => {
    const { data, error } = await supabase
      .from("project_assignments")
      .delete()
      .eq("id", Number(assignment_id))
      .select();
    if (error) throw error;
    return data?.[0] || null;
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const from = source.droppableId;
    const to = destination.droppableId;
    const internId = draggableId;

    // optimistic update
    setAssignmentMap((prev) => {
      const next = { ...prev };

      // remove from source
      if (from === POOL) {
        const arr = Array.from(next[POOL] || []);
        arr.splice(source.index, 1);
        next[POOL] = arr;
      } else {
        const arr = Array.from(next[from] || []);
        arr.splice(source.index, 1);
        next[from] = arr;
      }

      // add to destination
      if (to === POOL) {
        const arr = Array.from(next[POOL] || []);
        if (!arr.includes(internId)) arr.splice(destination.index, 0, internId);
        next[POOL] = arr;
      } else {
        const arr = Array.from(next[to] || []);
        if (!arr.some((a) => a.intern_id === internId)) {
          arr.splice(destination.index, 0, { intern_id: internId, assignment_id: null, assigned_at: null });
        }
        next[to] = arr;
        next[POOL] = (next[POOL] || []).filter((iid) => iid !== internId);
      }

      return next;
    });

    try {
      if (to !== POOL) {
        const inserted = await insertAssignment({ project_id: to, intern_id: internId });
        setAssignmentMap((prev) => {
          const next = { ...prev };
          next[to] = next[to].map((item) =>
            item.intern_id === internId && !item.assignment_id
              ? { ...item, assignment_id: inserted.id, assigned_at: inserted.assigned_at }
              : item
          );
          return next;
        });
      } else {
        if (from !== POOL) {
          const { data: found, error: fErr } = await supabase
            .from("project_assignments")
            .select("id")
            .eq("project_id", Number(from))
            .eq("intern_id", internId);
          if (!fErr && found && found.length > 0) {
            for (const r of found) {
              await deleteAssignment({ assignment_id: r.id });
            }
          }
        }
      }
    } catch (e) {
      console.error("Error syncing assignment change", e);
      // reload full data on failure
      await loadData();
    }
  };

  if (loading) {
    return <div className="p-4">Loading Project Manager...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Project Manager</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {/* Intern Pool */}
          <Droppable droppableId={POOL}>
            {(prov) => (
              <div ref={prov.innerRef} {...prov.droppableProps} className="p-4 bg-gray-100 rounded min-h-[200px]">
                <h2 className="font-bold mb-2">Interns (Pool)</h2>
                {(assignmentMap[POOL] || []).map((iid, idx) => (
                  <Draggable key={iid} draggableId={iid} index={idx}>
                    {(dprov, dsnap) => (
                      <div
                        ref={dprov.innerRef}
                        {...dprov.draggableProps}
                        {...dprov.dragHandleProps}
                        className={`p-2 m-2 bg-white rounded shadow ${dsnap.isDragging ? "opacity-90" : ""}`}
                      >
                        {interns.find((i) => i.id === iid)?.full_name || iid}
                      </div>
                    )}
                  </Draggable>
                ))}
                {prov.placeholder}
              </div>
            )}
          </Droppable>

          {/* Projects */}
          {projects.map((proj) => {
            const key = String(proj.id);
            const assigned = assignmentMap[key] || [];
            return (
              <Droppable droppableId={key} key={key}>
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.droppableProps} className="p-4 bg-blue-50 rounded min-h-[200px]">
                    <h2 className="font-bold">{proj.name}</h2>
                    <div className="text-sm text-gray-600 mb-2">
                      {proj.priority} · {proj.stage} {proj.deadline ? `· due ${proj.deadline}` : ""}
                    </div>
                    {assigned.map((a, idx) => (
                      <Draggable key={a.intern_id} draggableId={a.intern_id} index={idx}>
                        {(dprov, dsnap) => (
                          <div
                            ref={dprov.innerRef}
                            {...dprov.draggableProps}
                            {...dprov.dragHandleProps}
                            className={`p-2 m-2 bg-white rounded shadow ${dsnap.isDragging ? "opacity-90" : ""}`}
                          >
                            {interns.find((i) => i.id === a.intern_id)?.full_name || a.intern_id}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ProjectManager;

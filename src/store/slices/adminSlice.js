// // src/store/slices/adminSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { api } from '../../utils/api';

// const mapId = (item) => {
//   if (!item) return item;
//   return { ...item, id: item._id || item.id };
// };

// // Makes
// export const fetchMakes = createAsyncThunk('admin/fetchMakes', async (_, { rejectWithValue }) => {
//   try {
//     const data = await api.getMakes();
//     return data.map(mapId);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const addMake = createAsyncThunk('admin/addMake', async (name, { rejectWithValue }) => {
//   try {
//     const data = await api.addMake(name);
//     return mapId(data);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const deleteMake = createAsyncThunk('admin/deleteMake', async (id, { rejectWithValue }) => {
//   try {
//     await api.deleteMake(id);
//     return id;
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });

// // Models
// export const fetchModels = createAsyncThunk('admin/fetchModels', async (_, { rejectWithValue }) => {
//   try {
//     const data = await api.getModels();
//     return data.map(mapId);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const addModel = createAsyncThunk('admin/addModel', async ({ makeId, name }, { rejectWithValue }) => {
//   try {
//     const data = await api.addModel(makeId, name);
//     return mapId(data);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const deleteModel = createAsyncThunk('admin/deleteModel', async (id, { rejectWithValue }) => {
//   try {
//     await api.deleteModel(id);
//     return id;
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });

// // Faults
// export const fetchFaults = createAsyncThunk('admin/fetchFaults', async (_, { rejectWithValue }) => {
//   try {
//     const data = await api.getFaults();
//     return data.map(mapId);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const addFault = createAsyncThunk('admin/addFault', async (name, { rejectWithValue }) => {
//   try {
//     const data = await api.addFault(name);
//     return mapId(data);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const deleteFault = createAsyncThunk('admin/deleteFault', async (id, { rejectWithValue }) => {
//   try {
//     await api.deleteFault(id);
//     return id;
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });

// // Drawers
// export const fetchDrawers = createAsyncThunk('admin/fetchDrawers', async (_, { rejectWithValue }) => {
//   try {
//     const data = await api.getDrawers();
//     return data.map(mapId);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const addDrawer = createAsyncThunk('admin/addDrawer', async (name, { rejectWithValue }) => {
//   try {
//     const data = await api.addDrawer(name);
//     return mapId(data);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const deleteDrawer = createAsyncThunk('admin/deleteDrawer', async (id, { rejectWithValue }) => {
//   try {
//     await api.deleteDrawer(id);
//     return id;
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });

// // Engineers
// export const fetchEngineers = createAsyncThunk('admin/fetchEngineers', async (_, { rejectWithValue }) => {
//   try {
//     const data = await api.getEngineers();
//     return data.map(mapId);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const addEngineer = createAsyncThunk('admin/addEngineer', async (name, { rejectWithValue }) => {
//   try {
//     const data = await api.addEngineer(name);
//     return mapId(data);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const deleteEngineer = createAsyncThunk('admin/deleteEngineer', async (id, { rejectWithValue }) => {
//   try {
//     await api.deleteEngineer(id);
//     return id;
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const updateEngineer = createAsyncThunk('admin/updateEngineer', async ({ id, name }, { rejectWithValue }) => {
//   try {
//     const data = await api.updateEngineer(id, name);
//     return mapId(data);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });

// // Sales Reps
// export const fetchSalesReps = createAsyncThunk('admin/fetchSalesReps', async (_, { rejectWithValue }) => {
//   try {
//     const data = await api.getSalesReps();
//     return data.map(mapId);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const addSalesRep = createAsyncThunk('admin/addSalesRep', async (name, { rejectWithValue }) => {
//   try {
//     const data = await api.addSalesRep(name);
//     return mapId(data);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const updateSalesRep = createAsyncThunk('admin/updateSalesRep', async ({ id, name }, { rejectWithValue }) => {
//   try {
//     const data = await api.updateSalesRep(id, name);
//     return mapId(data);
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });
// export const deleteSalesRep = createAsyncThunk('admin/deleteSalesRep', async (id, { rejectWithValue }) => {
//   try {
//     await api.deleteSalesRep(id);
//     return id;
//   } catch (error) {
//     return rejectWithValue(error.message);
//   }
// });

// const adminSlice = createSlice({
//   name: 'admin',
//   initialState: { 
//     engineers: [], 
//     makes: [], 
//     models: [], 
//     faults: [], 
//     drawers: [], 
//     salesReps: [], 
//     loading: false, 
//     error: null 
//   },
//   extraReducers: (builder) => {
//     builder
//       // Makes
//       .addCase(fetchMakes.pending, (state) => { state.loading = true; state.error = null; })
//       .addCase(fetchMakes.fulfilled, (state, action) => { state.loading = false; state.makes = action.payload; })
//       .addCase(fetchMakes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
//       .addCase(addMake.fulfilled, (state, action) => { state.makes.push(action.payload); })
//       .addCase(deleteMake.fulfilled, (state, action) => { state.makes = state.makes.filter(m => m.id !== action.payload); })
//       // Models
//       .addCase(fetchModels.pending, (state) => { state.loading = true; state.error = null; })
//       .addCase(fetchModels.fulfilled, (state, action) => { state.loading = false; state.models = action.payload; })
//       .addCase(fetchModels.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
//       .addCase(addModel.fulfilled, (state, action) => { state.models.push(action.payload); })
//       .addCase(deleteModel.fulfilled, (state, action) => { state.models = state.models.filter(m => m.id !== action.payload); })
//       // Faults
//       .addCase(fetchFaults.pending, (state) => { state.loading = true; state.error = null; })
//       .addCase(fetchFaults.fulfilled, (state, action) => { state.loading = false; state.faults = action.payload; })
//       .addCase(fetchFaults.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
//       .addCase(addFault.fulfilled, (state, action) => { state.faults.push(action.payload); })
//       .addCase(deleteFault.fulfilled, (state, action) => { state.faults = state.faults.filter(f => f.id !== action.payload); })
//       // Drawers
//       .addCase(fetchDrawers.pending, (state) => { state.loading = true; state.error = null; })
//       .addCase(fetchDrawers.fulfilled, (state, action) => { state.loading = false; state.drawers = action.payload; })
//       .addCase(fetchDrawers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
//       .addCase(addDrawer.fulfilled, (state, action) => { state.drawers.push(action.payload); })
//       .addCase(deleteDrawer.fulfilled, (state, action) => { state.drawers = state.drawers.filter(d => d.id !== action.payload); })
//       // Engineers
//       .addCase(fetchEngineers.pending, (state) => { state.loading = true; state.error = null; })
//       .addCase(fetchEngineers.fulfilled, (state, action) => { state.loading = false; state.engineers = action.payload; })
//       .addCase(fetchEngineers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
//       .addCase(addEngineer.fulfilled, (state, action) => { state.engineers.push(action.payload); })
//       .addCase(deleteEngineer.fulfilled, (state, action) => { state.engineers = state.engineers.filter(e => e.id !== action.payload); })
//       .addCase(updateEngineer.fulfilled, (state, action) => { const idx = state.engineers.findIndex(e => e.id === action.payload.id); if (idx !== -1) state.engineers[idx] = action.payload; })
//       // Sales Reps
//       .addCase(fetchSalesReps.pending, (state) => { state.loading = true; state.error = null; })
//       .addCase(fetchSalesReps.fulfilled, (state, action) => { state.loading = false; state.salesReps = action.payload; })
//       .addCase(fetchSalesReps.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
//       .addCase(addSalesRep.fulfilled, (state, action) => { state.salesReps.push(action.payload); })
//       .addCase(updateSalesRep.fulfilled, (state, action) => { const idx = state.salesReps.findIndex(r => r.id === action.payload.id); if (idx !== -1) state.salesReps[idx] = action.payload; })
//       .addCase(deleteSalesRep.fulfilled, (state, action) => { state.salesReps = state.salesReps.filter(r => r.id !== action.payload); });
//   },
// });

// export default adminSlice.reducer;

//==========================================

// src/store/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

// ─── Async Thunks ──────────────────────────────────────────────────────────
export const fetchEngineers = createAsyncThunk('admin/fetchEngineers', async () => {
  return await api.getEngineers();
});

export const addEngineer = createAsyncThunk('admin/addEngineer', async (name) => {
  return await api.addEngineer(name);
});

export const updateEngineer = createAsyncThunk('admin/updateEngineer', async ({ id, name }) => {
  return await api.updateEngineer(id, name);
});

export const deleteEngineer = createAsyncThunk('admin/deleteEngineer', async (id) => {
  return await api.deleteEngineer(id);
});

export const fetchMakes = createAsyncThunk('admin/fetchMakes', async () => {
  return await api.getMakes();
});

export const addMake = createAsyncThunk('admin/addMake', async (name) => {
  return await api.addMake(name);
});

export const deleteMake = createAsyncThunk('admin/deleteMake', async (id) => {
  return await api.deleteMake(id);
});

export const fetchModels = createAsyncThunk('admin/fetchModels', async () => {
  return await api.getModels();
});

export const addModel = createAsyncThunk('admin/addModel', async ({ makeId, name }) => {
  return await api.addModel(makeId, name);
});

export const deleteModel = createAsyncThunk('admin/deleteModel', async (id) => {
  return await api.deleteModel(id);
});

export const fetchDrawers = createAsyncThunk('admin/fetchDrawers', async () => {
  return await api.getDrawers();
});

export const addDrawer = createAsyncThunk('admin/addDrawer', async (name) => {
  return await api.addDrawer(name);
});

export const deleteDrawer = createAsyncThunk('admin/deleteDrawer', async (id) => {
  return await api.deleteDrawer(id);
});

export const fetchSalesReps = createAsyncThunk('admin/fetchSalesReps', async () => {
  return await api.getSalesReps();
});

export const addSalesRep = createAsyncThunk('admin/addSalesRep', async (name) => {
  return await api.addSalesRep(name);
});

export const updateSalesRep = createAsyncThunk('admin/updateSalesRep', async ({ id, name }) => {
  return await api.updateSalesRep(id, name);
});

export const deleteSalesRep = createAsyncThunk('admin/deleteSalesRep', async (id) => {
  return await api.deleteSalesRep(id);
});

// ─── NEW: Faults ──────────────────────────────────────────────────────────
export const fetchFaults = createAsyncThunk('admin/fetchFaults', async () => {
  return await api.getFaults();
});

export const addFault = createAsyncThunk('admin/addFault', async (name) => {
  return await api.addFault(name);
});

export const deleteFault = createAsyncThunk('admin/deleteFault', async (id) => {
  return await api.deleteFault(id);
});

// ─── NEW: Dealers ──────────────────────────────────────────────────────────
export const fetchDealers = createAsyncThunk('admin/fetchDealers', async () => {
  return await api.getDealers();
});

// ─── Slice ──────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    engineers: [],
    makes: [],
    models: [],
    drawers: [],
    salesReps: [],
    faults: [],
    dealers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Engineers
      .addCase(fetchEngineers.pending, (state) => { state.loading = true; })
      .addCase(fetchEngineers.fulfilled, (state, action) => {
        state.loading = false;
        state.engineers = action.payload;
      })
      .addCase(fetchEngineers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addEngineer.fulfilled, (state, action) => {
        state.engineers.push(action.payload);
      })
      .addCase(updateEngineer.fulfilled, (state, action) => {
        const index = state.engineers.findIndex(e => e.id === action.payload.id);
        if (index !== -1) state.engineers[index] = action.payload;
      })
      .addCase(deleteEngineer.fulfilled, (state, action) => {
        state.engineers = state.engineers.filter(e => e.id !== action.payload.id);
      })
      // Makes
      .addCase(fetchMakes.fulfilled, (state, action) => {
        state.makes = action.payload;
      })
      .addCase(addMake.fulfilled, (state, action) => {
        state.makes.push(action.payload);
      })
      .addCase(deleteMake.fulfilled, (state, action) => {
        state.makes = state.makes.filter(m => m.id !== action.payload.id);
      })
      // Models
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.models = action.payload;
      })
      .addCase(addModel.fulfilled, (state, action) => {
        state.models.push(action.payload);
      })
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.models = state.models.filter(m => m.id !== action.payload.id);
      })
      // Drawers
      .addCase(fetchDrawers.fulfilled, (state, action) => {
        state.drawers = action.payload;
      })
      .addCase(addDrawer.fulfilled, (state, action) => {
        state.drawers.push(action.payload);
      })
      .addCase(deleteDrawer.fulfilled, (state, action) => {
        state.drawers = state.drawers.filter(d => d.id !== action.payload.id);
      })
      // Sales Reps
      .addCase(fetchSalesReps.fulfilled, (state, action) => {
        state.salesReps = action.payload;
      })
      .addCase(addSalesRep.fulfilled, (state, action) => {
        state.salesReps.push(action.payload);
      })
      .addCase(updateSalesRep.fulfilled, (state, action) => {
        const index = state.salesReps.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.salesReps[index] = action.payload;
      })
      .addCase(deleteSalesRep.fulfilled, (state, action) => {
        state.salesReps = state.salesReps.filter(s => s.id !== action.payload.id);
      })
      // ─── NEW: Faults ─────────────────────────────────────────────────────
      .addCase(fetchFaults.fulfilled, (state, action) => {
        state.faults = action.payload;
      })
      .addCase(addFault.fulfilled, (state, action) => {
        state.faults.push(action.payload);
      })
      .addCase(deleteFault.fulfilled, (state, action) => {
        state.faults = state.faults.filter(f => f.id !== action.payload.id);
      })
      // ─── NEW: Dealers ─────────────────────────────────────────────────────
      .addCase(fetchDealers.fulfilled, (state, action) => {
        state.dealers = action.payload;
      });
  },
});

export default adminSlice.reducer;
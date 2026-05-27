// src/store/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

const mapId = (item) => {
  if (!item) return item;
  return { ...item, id: item._id || item.id };
};

// ─── Makes ───────────────────────────────────────────────
export const fetchMakes = createAsyncThunk('admin/fetchMakes', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getMakes();
    return data.map(mapId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addMake = createAsyncThunk('admin/addMake', async (name, { rejectWithValue }) => {
  try {
    const data = await api.addMake(name);
    return mapId(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteMake = createAsyncThunk('admin/deleteMake', async (id, { rejectWithValue }) => {
  try {
    await api.deleteMake(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ─── Models ──────────────────────────────────────────────
export const fetchModels = createAsyncThunk('admin/fetchModels', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getModels();
    return data.map(mapId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addModel = createAsyncThunk('admin/addModel', async ({ makeId, name }, { rejectWithValue }) => {
  try {
    const data = await api.addModel(makeId, name);
    return mapId(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteModel = createAsyncThunk('admin/deleteModel', async (id, { rejectWithValue }) => {
  try {
    await api.deleteModel(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ─── Faults ──────────────────────────────────────────────
export const fetchFaults = createAsyncThunk('admin/fetchFaults', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getFaults();
    return data.map(mapId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addFault = createAsyncThunk('admin/addFault', async (name, { rejectWithValue }) => {
  try {
    const data = await api.addFault(name);
    return mapId(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteFault = createAsyncThunk('admin/deleteFault', async (id, { rejectWithValue }) => {
  try {
    await api.deleteFault(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ─── Drawers ─────────────────────────────────────────────
export const fetchDrawers = createAsyncThunk('admin/fetchDrawers', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getDrawers();
    return data.map(mapId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addDrawer = createAsyncThunk('admin/addDrawer', async (name, { rejectWithValue }) => {
  try {
    const data = await api.addDrawer(name);
    return mapId(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteDrawer = createAsyncThunk('admin/deleteDrawer', async (id, { rejectWithValue }) => {
  try {
    await api.deleteDrawer(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ─── Engineers ───────────────────────────────────────────
export const fetchEngineers = createAsyncThunk('admin/fetchEngineers', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getEngineers();
    return data.map(mapId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addEngineer = createAsyncThunk('admin/addEngineer', async (name, { rejectWithValue }) => {
  try {
    const data = await api.addEngineer(name);
    return mapId(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteEngineer = createAsyncThunk('admin/deleteEngineer', async (id, { rejectWithValue }) => {
  try {
    await api.deleteEngineer(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateEngineer = createAsyncThunk('admin/updateEngineer', async ({ id, name }, { rejectWithValue }) => {
  try {
    const data = await api.updateEngineer(id, name);
    return mapId(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ─── Slice ───────────────────────────────────────────────
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    engineers: [],
    makes: [],
    models: [],
    faults: [],
    drawers: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Makes
      .addCase(fetchMakes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMakes.fulfilled, (state, action) => {
        state.loading = false;
        state.makes = action.payload;
      })
      .addCase(fetchMakes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMake.fulfilled, (state, action) => {
        state.makes.push(action.payload);
      })
      .addCase(deleteMake.fulfilled, (state, action) => {
        state.makes = state.makes.filter(m => m.id !== action.payload);
      })
      .addCase(deleteMake.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Models
      .addCase(fetchModels.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addModel.fulfilled, (state, action) => {
        state.models.push(action.payload);
      })
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.models = state.models.filter(m => m.id !== action.payload);
      })
      .addCase(deleteModel.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Faults
      .addCase(fetchFaults.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFaults.fulfilled, (state, action) => {
        state.loading = false;
        state.faults = action.payload;
      })
      .addCase(fetchFaults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFault.fulfilled, (state, action) => {
        state.faults.push(action.payload);
      })
      .addCase(deleteFault.fulfilled, (state, action) => {
        state.faults = state.faults.filter(f => f.id !== action.payload);
      })
      .addCase(deleteFault.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Drawers
      .addCase(fetchDrawers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDrawers.fulfilled, (state, action) => {
        state.loading = false;
        state.drawers = action.payload;
      })
      .addCase(fetchDrawers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addDrawer.fulfilled, (state, action) => {
        state.drawers.push(action.payload);
      })
      .addCase(deleteDrawer.fulfilled, (state, action) => {
        state.drawers = state.drawers.filter(d => d.id !== action.payload);
      })
      .addCase(deleteDrawer.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Engineers
      .addCase(fetchEngineers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEngineers.fulfilled, (state, action) => {
        state.loading = false;
        state.engineers = action.payload;
      })
      .addCase(fetchEngineers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addEngineer.fulfilled, (state, action) => {
        state.engineers.push(action.payload);
      })
      .addCase(deleteEngineer.fulfilled, (state, action) => {
        state.engineers = state.engineers.filter(e => e.id !== action.payload);
      })
      .addCase(deleteEngineer.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateEngineer.fulfilled, (state, action) => {
        const index = state.engineers.findIndex(e => e.id === action.payload.id);
        if (index !== -1) state.engineers[index] = action.payload;
      });
  },
});

export default adminSlice.reducer;
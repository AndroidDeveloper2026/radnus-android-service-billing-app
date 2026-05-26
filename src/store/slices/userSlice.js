// src/store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  return await api.getUsers();
});

export const addUser = createAsyncThunk('users/addUser', async (userData) => {
  return await api.addUser(userData);
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id) => {
  await api.deleteUser(id);
  return id;
});

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => { state.loading = false; })
      .addCase(addUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u._id !== action.payload);
      });
  },
});

export default userSlice.reducer;
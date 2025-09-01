import { registerAs } from '@nestjs/config';

export default registerAs('wallet', () => ({
  privateKey: process.env.PRIVATE_KEY,
}));

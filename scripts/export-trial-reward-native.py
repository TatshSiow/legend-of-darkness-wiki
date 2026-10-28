from pathlib import Path
import os,json,hashlib
backup=Path(r'C:/Users/Tatsh/game-backups/legend-of-darkness-20261021')
os.chdir(backup)
exec((backup/'decode-item-data.py').read_text(encoding='utf-8-sig').split('print("KEY RESULT"')[0])
root=Path(r'C:/Users/Tatsh/Desktop/git/dark legend/wiki-svelte')
rows=json.loads((root/'static/data/trial.json').read_text(encoding='utf-8'))
stack=0x300e0000
result=None
random=0
threshold=0
def put(a,v):u.mem_write(a,struct.pack('<I',v&0xffffffff))
def hook(uc,a,size,data):
 global result,threshold
 if a==0xa040e8:
  uc.reg_write(UC_ARM_REG_R0,random);uc.reg_write(UC_ARM_REG_PC,uc.reg_read(UC_ARM_REG_LR))
 if a==0x77c232:threshold=uc.reg_read(UC_ARM_REG_R7)
 if a in (0x77c236,0x77c2ea):result=a==0x77c236;uc.emu_stop()
u.hook_add(UC_HOOK_CODE,hook)
cases=[]
for hard,weight in sorted(set((r['hard'],r['itemweight']) for r in rows)):
 hits=[]
 for random in range(100):
  put(stack+0x18,500);put(stack+4,hard);put(stack+0x20,hard);put(stack+0x1c,weight)
  u.reg_write(UC_ARM_REG_SP,stack);u.reg_write(UC_ARM_REG_R4,500)
  result=None
  u.emu_start(0x77c1e7,0x77c2eb,count=100000)
  assert result is not None
  if result:hits.append(random)
 cases.append({'requiredDifficulty':hard,'weight':weight,'threshold':threshold,'successfulResidues':hits,'rate':len(hits)})
for score,difficulty in [(499,3),(500,0)]:
 put(stack+0x18,score);put(stack+4,difficulty);put(stack+0x20,1);u.reg_write(UC_ARM_REG_SP,stack);u.reg_write(UC_ARM_REG_R4,500);result=None
 u.emu_start(0x77c1e7,0x77c2eb,count=100000);assert result is False
out={'sha256':hashlib.sha256(d).hexdigest(),'stage':'Original 0x77c1e6..0x77c234 including original float helpers; rand controlled to every residue 0..99. Item creation skipped.','cases':cases}
(root/'static/data/trial-reward-native.json').write_text(json.dumps(out,separators=(',',':'))+'\n',encoding='utf-8')
print([(r['requiredDifficulty'],r['weight'],r['rate']) for r in cases])

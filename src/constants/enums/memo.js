// 便签配色：低饱和的「浅底 + 同色系深字」成组出现，保证任何一组都读得清。
// 不给取色器——前台随手贴一张便签，不该在这里挑颜色；新建时默认从本表随机取一组。
// ⚠️ 值会被后端按 CssColorUtils 校验（只收 #hex / rgb() / rgba()），改这里保持同样的写法
export const MemoColorList = [
    {key: 'butter', bg: '#F4E7B5', text: '#5A4A18'},
    {key: 'mint', bg: '#CFE3D5', text: '#2E4E3B'},
    {key: 'sky', bg: '#CFDCEA', text: '#2B4A64'},
    {key: 'lilac', bg: '#DBD3E8', text: '#453A5E'},
    {key: 'peach', bg: '#F1D8D1', text: '#66403A'},
    {key: 'sand', bg: '#EDDDC6', text: '#6A4E2D'},
    {key: 'teal', bg: '#CDE1E0', text: '#2D4F4E'},
    {key: 'ash', bg: '#DEDEDA', text: '#42433F'},
]

export function randomMemoColor() {
    return MemoColorList[Math.floor(Math.random() * MemoColorList.length)]
}
